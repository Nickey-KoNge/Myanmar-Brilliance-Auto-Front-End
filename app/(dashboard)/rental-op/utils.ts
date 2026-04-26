import { VehicleAssign } from "./types";

export const getInitialVehicleOdo = (assign: VehicleAssign): string => {
  if (assign.vehicle?.current_odometer)
    return String(assign.vehicle.current_odometer);
  return "0";
};

export const calculateConsumedDays = (
  startStr: string,
  endStr: string,
): number => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (end <= start) return 0;

  const startMidnight = new Date(start);
  startMidnight.setHours(0, 0, 0, 0);

  const endMidnight = new Date(end);
  endMidnight.setHours(0, 0, 0, 0);

  let midnightsCrossed = Math.round(
    (endMidnight.getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (start.getHours() >= 16) {
    midnightsCrossed = Math.max(0, midnightsCrossed - 1);
  }

  return midnightsCrossed;
};

export const formatExtraTime = (diffMs: number): string => {
  const totalMins = Math.floor(diffMs / (1000 * 60));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0 && mins > 0) return `${hrs} Hr ${mins} Min`;
  if (hrs > 0) return `${hrs} Hr`;
  if (mins > 0) return `${mins} Min`;
  return "0";
};
