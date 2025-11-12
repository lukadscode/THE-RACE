export function exportCSV(players, filename = "the_race_results.csv") {
  const arr = Object.values(players).map((p) => ({
    lane: p.lane,
    name: p.name,
    meters: p.meters,
    effectiveMeters: p.effectiveMeters,
    watts: p.watts,
    spm: p.spm,
  }));
  const header = Object.keys(
    arr[0] || {
      lane: 0,
      name: "",
      meters: 0,
      effectiveMeters: 0,
      watts: 0,
      spm: 0,
    }
  ).join(",");
  const rows = arr.map((o) => Object.values(o).join(","));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
