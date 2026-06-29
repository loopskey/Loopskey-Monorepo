import { Select, SelectTrigger, SelectValue } from "@ui/select";
import { SelectContent, SelectItem } from "@ui/select";
import { TSelectField } from "@/types/provider-dashboard.types";
import { Field } from "@modules/ProviderDashboard/parts/provider-stepper-field";

export const SelectField = ({
  label,
  value,
  items,
  onChange,
}: TSelectField) => (
  <Field label={label}>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="rounded-2xl">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Field>
);
