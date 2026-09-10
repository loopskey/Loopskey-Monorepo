"use client";

import { ASSOCIATION_BAND_SEMANTICS } from "@utils/association-compliance-bands";
import { ASSOCIATION_BAND_ORDER } from "@utils/association-compliance-bands";
import { semanticChartColor } from "@hooks/useChartPalette";
import { useChartSemantics } from "@hooks/useChartPalette";

import * as T from "@/types/association-dashboard.types";
import * as R from "recharts";

const BAR_HEIGHT = 96;

export const AttentionBandStrip = ({
  rows,
  label,
  locale,
  onSelectAtRisk,
}: T.TAssociationAttentionStripChart) => {
  const semantics = useChartSemantics();

  const descriptionId = "association-attention-strip-description";

  const stacked = [
    rows.reduce<Record<string, number | string>>(
      (row, band) => ({ ...row, [band.id]: band.count }),
      { name: label("strip.label") },
    ),
  ];

  return (
    <div>
      <p id={descriptionId} className="sr-only">
        {label("strip.description")}
      </p>

      <div
        role="img"
        aria-describedby={descriptionId}
        aria-label={label("strip.label")}
        style={{ height: BAR_HEIGHT }}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.BarChart layout="vertical" data={stacked} margin={{ left: 0 }}>
            <R.XAxis type="number" hide />
            <R.YAxis type="category" dataKey="name" hide />
            <R.Tooltip
              cursor={{ opacity: 0.1 }}
              formatter={(value, name) => [
                Number(value ?? 0).toLocaleString(locale),
                label(`bands.${String(name)}`),
              ]}
              contentStyle={{
                borderRadius: 8,
                fontSize: 12,
                border: "1px solid var(--border)",
                background: "var(--popover)",
                color: "var(--popover-foreground)",
                boxShadow: "0 6px 18px -8px rgb(13 25 61 / 12%)",
              }}
            />

            {ASSOCIATION_BAND_ORDER.map((band, index) => (
              <R.Bar
                key={band}
                stackId="bands"
                dataKey={band}
                radius={
                  index === 0
                    ? [8, 0, 0, 8]
                    : index === ASSOCIATION_BAND_ORDER.length - 1
                      ? [0, 8, 8, 0]
                      : 0
                }
                cursor={band === "AT_RISK" ? "pointer" : undefined}
                onClick={band === "AT_RISK" ? onSelectAtRisk : undefined}
                fill={semanticChartColor(
                  semantics,
                  ASSOCIATION_BAND_SEMANTICS[band],
                )}
              />
            ))}
          </R.BarChart>
        </R.ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>{label("strip.label")}</caption>
        <thead>
          <tr>
            <th scope="col">{label("chartTable.band")}</th>
            <th scope="col">{label("chartTable.members")}</th>
            <th scope="col">{label("chartTable.share")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.count.toLocaleString(locale)}</td>
              <td>{`${row.share.toLocaleString(locale)}%`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
