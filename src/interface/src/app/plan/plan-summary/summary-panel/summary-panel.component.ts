import { Component, Input, OnChanges } from '@angular/core';
import area from '@turf/area';
import { FeatureCollection } from 'geojson';

import { Plan, Region, User } from '../../../types';

export interface SummaryInput {
  id?: string;
  type: string;
  name: string;
  owner: string;
  region: Region;
  area: GeoJSON.GeoJSON;
  status?: string;
  createdTime?: number;
  scenarios?: number;
  configs?: number;
  acres: number;
}

// todo: move this to shared types
export enum ConditionName {
  GOOD = 'Good',
  LEANING_GOOD = 'Leaning good',
  NEUTRAL = 'Neutral',
  LEANING_POOR = 'Leaning poor',
  POOR = 'Poor',
}

export const conditionScoreColorMap: Record<ConditionName, string> = {
  [ConditionName.GOOD]: '#010108',
  [ConditionName.LEANING_GOOD]: '#4c1761',
  [ConditionName.NEUTRAL]: '#b1354c',
  [ConditionName.LEANING_POOR]: '#F4511e',
  [ConditionName.POOR]: '#fdd853',
};

const SQUARE_METERS_PER_ACRE = 0.0002471054;

@Component({
  selector: 'summary-panel',
  templateUrl: './summary-panel.component.html',
  styleUrls: ['./summary-panel.component.scss'],
})
export class SummaryPanelComponent implements OnChanges {
  @Input() plan: Plan | null = null;
  @Input() owner: User | null = null;

  summaryInput: SummaryInput | null = null;
  conditionScore: ConditionName = ConditionName.POOR;
  futureConditionScore: ConditionName = ConditionName.LEANING_GOOD;
  conditionScoreColorMap = conditionScoreColorMap;

  ngOnChanges(): void {
    if (!!this.plan) {
      this.summaryInput = {
        id: this.plan.id,
        type: 'Plan',
        name: this.plan.name,
        owner: this.owner?.firstName
          ? this.owner?.firstName + ' ' + this.owner?.lastName
          : this.owner?.username ?? 'Guest',
        region: this.plan.region,
        area: this.plan.planningArea!,
        createdTime: this.plan.createdTimestamp,
        scenarios: this.plan.savedScenarios,
        configs: this.plan.configs,
        acres: this.calculateAcres(this.plan.planningArea!),
        status: 'In progress',
      };
    }
  }

  calculateAcres(planningArea: GeoJSON.GeoJSON) {
    const squareMeters = area(planningArea as FeatureCollection);
    const acres = squareMeters * SQUARE_METERS_PER_ACRE;
    return Math.round(acres);
  }
}
