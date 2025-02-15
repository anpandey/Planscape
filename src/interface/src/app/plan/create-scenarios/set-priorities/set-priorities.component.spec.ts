import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatRadioGroupHarness } from '@angular/material/radio/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of } from 'rxjs';
import { MaterialModule } from 'src/app/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import {
  Plan,
  Region,
  TreatmentQuestionConfig,
  TreatmentGoalConfig,
} from 'src/app/types';

import { MapService } from './../../../services/map.service';
import { PlanService } from './../../../services/plan.service';
import { ConditionsConfig } from './../../../types/data.types';
import { ColormapConfig } from './../../../types/legend.types';
import {
  ScoreColumn,
  SetPrioritiesComponent,
} from './set-priorities.component';

describe('SetPrioritiesComponent', () => {
  let component: SetPrioritiesComponent;
  let fixture: ComponentFixture<SetPrioritiesComponent>;
  let loader: HarnessLoader;

  let fakeMapService: MapService;
  let fakePlanService: PlanService;

  const defaultSelectedQuestion: TreatmentQuestionConfig = {
    short_question_text: '',
    priorities: [''],
    weights: [0],
  };
  const testQuestion: TreatmentQuestionConfig = {
    short_question_text: 'test_question',
    priorities: ['test_priority'],
    weights: [1],
  };

  const fakeColormapConfig: ColormapConfig = {
    name: 'fakecolormap',
    values: [
      {
        rgb: '#000000',
        name: 'fakelabel',
      },
    ],
  };

  beforeEach(async () => {
    fakeMapService = jasmine.createSpyObj<MapService>(
      'MapService',
      {
        getColormap: of(fakeColormapConfig),
      },
      {
        conditionsConfig$: new BehaviorSubject<ConditionsConfig | null>({
          pillars: [
            {
              pillar_name: 'test_pillar_1',
              filepath: 'test_pillar_1',
              display: true,
              elements: [
                {
                  display: true,
                  element_name: 'test_element_1',
                  filepath: 'test_element_1',
                  metrics: [
                    {
                      metric_name: 'test_metric_1',
                      filepath: 'test_metric_1',
                    },
                  ],
                },
              ],
            },
          ],
        }),
      }
    );
    fakePlanService = jasmine.createSpyObj<PlanService>(
      'PlanService',
      {
        getConditionScoresForPlanningArea: of({
          conditions: [
            {
              condition: 'test_pillar_1',
              mean_score: 0.1,
            },
            {
              condition: 'test_element_1',
              mean_score: -0.7,
            },
            {
              condition: 'test_metric_1',
              mean_score: 0.4,
            },
          ],
        }),
      },
      {
        treatmentGoalsConfig$: new BehaviorSubject<
          TreatmentGoalConfig[] | null
        >([
          {
            category_name: 'test_category',
            questions: [testQuestion],
          },
        ]),
      }
    );
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        SharedModule,
      ],
      declarations: [SetPrioritiesComponent],
      providers: [
        FormBuilder,
        {
          provide: MapService,
          useValue: fakeMapService,
        },
        {
          provide: PlanService,
          useValue: fakePlanService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetPrioritiesComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    const fb = fixture.componentRef.injector.get(FormBuilder);
    component.formGroup = fb.group({
      selectedQuestion: [defaultSelectedQuestion],
    });
    component.treatmentGoals$ = [
      {
        category_name: 'test_category',
        questions: [testQuestion],
      },
    ];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate datasource', () => {
    const metric = {
      conditionName: 'test_metric_1',
      displayName: undefined,
      filepath: 'test_metric_1_normalized',
      children: [],
      level: 2,
      hidden: true,
    };
    const element = {
      conditionName: 'test_element_1',
      displayName: undefined,
      filepath: 'test_element_1_normalized',
      children: [metric],
      level: 1,
      expanded: false,
      hidden: true,
    };
    const pillar = {
      conditionName: 'test_pillar_1',
      displayName: undefined,
      filepath: 'test_pillar_1_normalized',
      children: [element],
      level: 0,
      expanded: false,
    };
    expect(component.datasource.data).toEqual([pillar, element, metric]);
  });

  it('selecting a priority should update the form value', async () => {
    const radioButtonGroup = await loader.getHarness(
      MatRadioGroupHarness.with({ name: 'treatmentGoalSelect' })
    );

    // Act: select the test treatment question
    await radioButtonGroup.checkRadioButton({
      label: testQuestion['short_question_text'],
    });

    expect(component.formGroup?.get('selectedQuestion')?.value).toEqual(
      testQuestion
    );
  });
});
