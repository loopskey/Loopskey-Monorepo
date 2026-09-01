"use client";

import { TAssociationCompositionChart } from "@/types/association-dashboard.types";
import { MEMBER_STATUS_SLOTS } from "@utils/association-roster-composition";
import { MEMBER_STATUS_ORDER } from "@utils/association-roster-composition";

import * as R from "recharts";

const DESCRIPTION_ID = "association-roster-composition-description";

export const AssociationRosterCompositionChart = ({
  rows,
  palette,
  statusLabel,
  onSegmentClick,
}: TAssociationCompositionChart) => {
  const accessibleTable = (
    <table className="sr-only">
      <caption>{statusLabel("caption")}</caption>

      <thead>
        <tr>
          <th scope="col">{statusLabel("groupHeader")}</th>
          {MEMBER_STATUS_ORDER.map((status) => (
            <th key={status} scope="col">
              {statusLabel(status)}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr key={row.groupId ?? "ungrouped"}>
            <th scope="row">{row.groupTitle}</th>
            {MEMBER_STATUS_ORDER.map((status) => (
              <td key={status}>{row[status]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <p id={DESCRIPTION_ID} className="sr-only">
        {statusLabel("chartDescription")}
      </p>

      <div
        role="img"
        className="h-80"
        aria-describedby={DESCRIPTION_ID}
        aria-label={statusLabel("chartLabel")}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.BarChart
            layout="vertical"
            data={rows}
            margin={{ left: 12, right: 12 }}
          >
            <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <R.XAxis type="number" allowDecimals={false} fontSize={12} />
            <R.YAxis
              width={140}
              type="category"
              dataKey="groupTitle"
              fontSize={12}
            />
            <R.Tooltip cursor={{ opacity: 0.1 }} />
            <R.Legend />

            {MEMBER_STATUS_ORDER.map((status) => (
              <R.Bar
                key={status}
                dataKey={status}
                stackId="composition"
                name={statusLabel(status)}
                fill={palette[MEMBER_STATUS_SLOTS[status]]}
                radius={[0, 8, 8, 0]}
                onClick={(entry: unknown) =>
                  onSegmentClick(
                    (entry as { payload?: { groupId: string | null } })?.payload
                      ?.groupId ?? null,
                    status,
                  )
                }
                className="cursor-pointer"
              />
            ))}
          </R.BarChart>
        </R.ResponsiveContainer>
      </div>

      {accessibleTable}
    </div>
  );
};

export default AssociationRosterCompositionChart;
