import { ASTVisitor, FragmentDefinitionNode, GraphQLError } from "graphql";
import { Kind, SelectionSetNode, ValidationContext } from "graphql";

export type OperationLimits = {
  maxDepth: number;
  maxAliases: number;
  maxFields: number;
};

export const DEFAULT_OPERATION_LIMITS: OperationLimits = {
  maxDepth: 14,
  maxAliases: 25,
  maxFields: 600,
};

class LimitExceeded extends Error {
  constructor(readonly reason: string) {
    super(reason);
  }
}

export const operationLimitsRule =
  (limits: OperationLimits = DEFAULT_OPERATION_LIMITS) =>
  (context: ValidationContext): ASTVisitor => {
    const fragments = new Map<string, FragmentDefinitionNode>();
    for (const definition of context.getDocument().definitions)
      if (definition.kind === Kind.FRAGMENT_DEFINITION)
        fragments.set(definition.name.value, definition);

    return {
      OperationDefinition(operation) {
        let fields = 0;
        let aliases = 0;

        const walk = (
          selectionSet: SelectionSetNode,
          depth: number,
          path: ReadonlySet<string>,
        ) => {
          for (const selection of selectionSet.selections) {
            if (selection.kind === Kind.FIELD) {
              if (selection.name.value.startsWith("__")) continue;
              fields += 1;
              if (selection.alias) aliases += 1;
              if (depth > limits.maxDepth)
                throw new LimitExceeded(
                  `exceeds the maximum depth of ${limits.maxDepth}`,
                );
              if (aliases > limits.maxAliases)
                throw new LimitExceeded(
                  `uses more than ${limits.maxAliases} aliases`,
                );
              if (fields > limits.maxFields)
                throw new LimitExceeded(
                  `selects more than ${limits.maxFields} fields`,
                );
              if (selection.selectionSet)
                walk(selection.selectionSet, depth + 1, path);
            } else if (selection.kind === Kind.INLINE_FRAGMENT) {
              walk(selection.selectionSet, depth, path);
            } else {
              const name = selection.name.value;
              const fragment = fragments.get(name);
              if (!fragment || path.has(name)) continue;
              walk(fragment.selectionSet, depth, new Set([...path, name]));
            }
          }
        };

        try {
          walk(operation.selectionSet, 1, new Set());
        } catch (error) {
          if (!(error instanceof LimitExceeded)) throw error;
          context.reportError(
            new GraphQLError(`Operation ${error.reason}.`, {
              nodes: operation,
              extensions: { code: "OPERATION_TOO_COMPLEX" },
            }),
          );
        }
      },
    };
  };
