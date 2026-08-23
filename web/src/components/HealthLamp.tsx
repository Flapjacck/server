import type { HealthState } from "../types";

type HealthLampProps = {
  state: HealthState;
};

export function HealthLamp({ state }: HealthLampProps) {
  return (
    <div className={`lamp ${state}`}>
      <span className="bulb" />
      <span>api {state}</span>
    </div>
  );
}
