import { Alignment } from "@blueprintjs/core";

import generatePanelPropertyConfig from "./propertyConfig/generatePanelPropertyConfig";
import { AutocompleteDataType } from "utils/autocomplete/TernServer";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { JSONFormWidgetProps } from ".";
import { ROOT_SCHEMA_KEY } from "../constants";
import { ValidationTypes } from "constants/WidgetValidation";
import { ButtonVariantTypes, ButtonPlacementTypes } from "components/constants";
import { ButtonWidgetProps } from "widgets/ButtonWidget/widget";
import { OnButtonClickProps } from "components/propertyControls/ButtonControl";
import { ComputedSchemaStatus, computeSchema } from "./helper";
import { EVALUATION_PATH } from "utils/DynamicBindingUtils";

const MAX_NESTING_LEVEL = 5;

const panelConfig = generatePanelPropertyConfig(MAX_NESTING_LEVEL);

export const sourceDataValidationFn = (
  value: any,
  props: JSONFormWidgetProps,
  _?: any,
) => {
  if (value === "") {
    return {
      isValid: false,
      parsed: {},
      messages: ["Source data cannot be empty."],
    };
  }

  if (_.isNil(value)) {
    return {
      isValid: true,
      parsed: {},
    };
  }

  if (_.isPlainObject(value)) {
    return {
      isValid: true,
      parsed: value,
    };
  }

  try {
    return {
      isValid: true,
      parsed: JSON.parse(value as string),
    };
  } catch (e) {
    return {
      isValid: false,
      parsed: {},
      messages: [(e as Error).message],
    };
  }
};

export const onGenerateFormClick = ({
  batchUpdateProperties,
  props,
}: OnButtonClickProps) => {
  const widgetProperties: JSONFormWidgetProps = props.widgetProperties;

  if (widgetProperties.autoGenerateForm) return;

  const currSourceData = widgetProperties[EVALUATION_PATH]?.evaluatedValues
    ?.sourceData as Record<string, any> | Record<string, any>[];

  const prevSourceData = widgetProperties.schema?.__root_schema__?.sourceData;

  const { dynamicPropertyPathList, schema, status } = computeSchema({
    currentDynamicPropertyPathList: widgetProperties.dynamicPropertyPathList,
    currSourceData,
    fieldThemeStylesheets: widgetProperties.childStylesheet,
    prevSchema: widgetProperties.schema,
    prevSourceData,
    widgetName: widgetProperties.widgetName,
  });

  if (status === ComputedSchemaStatus.LIMIT_EXCEEDED) {
    batchUpdateProperties({ fieldLimitExceeded: true });
    return;
  }

  if (status === ComputedSchemaStatus.UNCHANGED) {
    if (widgetProperties.fieldLimitExceeded) {
      batchUpdateProperties({ fieldLimitExceeded: false });
    }
    return;
  }

  if (status === ComputedSchemaStatus.UPDATED) {
    batchUpdateProperties({
      dynamicPropertyPathList,
      schema,
      fieldLimitExceeded: false,
    });
  }
};

const generateFormCTADisabled = (widgetProps: JSONFormWidgetProps) =>
  widgetProps.autoGenerateForm;

const generateButtonStyleControlsFor = (prefix: string) => [
  {
    propertyName: `${prefix}.buttonColor`,
    helpText: "??????????????????",
    label: "????????????",
    controlType: "COLOR_PICKER",
    isJSConvertible: true,
    isBindProperty: true,
    isTriggerProperty: false,
    validation: { type: ValidationTypes.TEXT },
  },
  {
    propertyName: `${prefix}.buttonVariant`,
    label: "????????????",
    controlType: "DROP_DOWN",
    helpText: "????????????????????????",
    options: [
      {
        label: "?????????",
        value: ButtonVariantTypes.PRIMARY,
      },
      {
        label: "????????????",
        value: ButtonVariantTypes.SECONDARY,
      },
      {
        label: "????????????",
        value: ButtonVariantTypes.TERTIARY,
      },
    ],
    isJSConvertible: true,
    isBindProperty: true,
    isTriggerProperty: false,
    validation: {
      type: ValidationTypes.TEXT,
      params: {
        allowedValues: [
          ButtonVariantTypes.PRIMARY,
          ButtonVariantTypes.SECONDARY,
          ButtonVariantTypes.TERTIARY,
        ],
        default: ButtonVariantTypes.PRIMARY,
      },
    },
  },
  {
    propertyName: `${prefix}.borderRadius`,
    label: "????????????",
    helpText: "??????????????????",
    controlType: "BORDER_RADIUS_OPTIONS",
    isJSConvertible: true,
    isBindProperty: true,
    isTriggerProperty: false,
    validation: { type: ValidationTypes.TEXT },
  },
  {
    propertyName: `${prefix}.boxShadow`,
    label: "??????",
    helpText: "??????????????????",
    controlType: "BOX_SHADOW_OPTIONS",
    isJSConvertible: true,
    isBindProperty: true,
    isTriggerProperty: false,
    validation: {
      type: ValidationTypes.TEXT,
    },
  },
  {
    propertyName: `${prefix}.iconName`,
    label: "??????",
    helpText: "??????????????????",
    controlType: "ICON_SELECT",
    isJSConvertible: true,
    isBindProperty: true,
    isTriggerProperty: false,
    updateHook: (
      props: ButtonWidgetProps,
      propertyPath: string,
      propertyValue: string,
    ) => {
      const propertiesToUpdate = [{ propertyPath, propertyValue }];
      if (!props.iconAlign) {
        propertiesToUpdate.push({
          propertyPath: `${prefix}.iconAlign`,
          propertyValue: Alignment.LEFT,
        });
      }
      return propertiesToUpdate;
    },
    validation: {
      type: ValidationTypes.TEXT,
    },
  },
  {
    propertyName: `${prefix}.placement`,
    label: "????????????",
    controlType: "DROP_DOWN",
    helpText: "????????????????????????????????????",
    options: [
      {
        label: "????????????",
        value: ButtonPlacementTypes.START,
      },
      {
        label: "????????????",
        value: ButtonPlacementTypes.BETWEEN,
      },
      {
        label: "????????????",
        value: ButtonPlacementTypes.CENTER,
      },
    ],
    defaultValue: ButtonPlacementTypes.CENTER,
    isJSConvertible: true,
    isBindProperty: true,
    isTriggerProperty: false,
    validation: {
      type: ValidationTypes.TEXT,
      params: {
        allowedValues: [
          ButtonPlacementTypes.START,
          ButtonPlacementTypes.BETWEEN,
          ButtonPlacementTypes.CENTER,
        ],
        default: ButtonPlacementTypes.CENTER,
      },
    },
  },
  {
    propertyName: `${prefix}.iconAlign`,
    label: "????????????",
    helpText: "??????????????????????????????",
    controlType: "ICON_TABS",
    options: [
      {
        icon: "VERTICAL_LEFT",
        value: "left",
      },
      {
        icon: "VERTICAL_RIGHT",
        value: "right",
      },
    ],
    isJSConvertible: true,
    isBindProperty: true,
    isTriggerProperty: false,
    validation: {
      type: ValidationTypes.TEXT,
      params: {
        allowedValues: ["center", "left", "right"],
      },
    },
  },
];

export const contentConfig = [
  {
    sectionName: "??????",
    children: [
      {
        propertyName: "sourceData",
        helpText: "?????? JSON ??????",
        label: "?????????",
        controlType: "INPUT_TEXT",
        placeholderText: '{ "name": "John", "age": 24 }',
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: sourceDataValidationFn,
            expected: {
              type: "JSON",
              example: `{ "name": "John Doe", "age": 29 }`,
              autocompleteDataType: AutocompleteDataType.OBJECT,
            },
          },
        },
        evaluationSubstitutionType: EvaluationSubstitutionType.SMART_SUBSTITUTE,
      },
      {
        propertyName: "autoGenerateForm",
        helpText:
          "???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????",
        label: "??????????????????",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        customJSControl: "INPUT_TEXT",
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "generateFormButton",
        label: "",
        controlType: "BUTTON",
        isJSConvertible: false,
        isBindProperty: false,
        buttonLabel: "????????????",
        onClick: onGenerateFormClick,
        isDisabled: generateFormCTADisabled,
        isTriggerProperty: false,
        dependencies: [
          "autoGenerateForm",
          "schema",
          "fieldLimitExceeded",
          "childStylesheet",
        ],
        evaluatedDependencies: ["sourceData"],
      },
      {
        propertyName: `schema.${ROOT_SCHEMA_KEY}.children`,
        helpText: "????????????",
        label: "????????????",
        controlType: "FIELD_CONFIGURATION",
        isBindProperty: false,
        isTriggerProperty: false,
        panelConfig,
        dependencies: ["schema", "childStylesheet"],
      },
    ],
  },
  {
    sectionName: "??????",
    children: [
      {
        propertyName: "title",
        label: "??????",
        helpText: "????????????",
        controlType: "INPUT_TEXT",
        placeholderText: "Update Order",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "isVisible",
        helpText: "?????????????????????/??????",
        label: "????????????",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "animateLoading",
        label: "?????????????????????",
        controlType: "SWITCH",
        helpText: "????????????????????????????????????????????????",
        defaultValue: true,
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "disabledWhenInvalid",
        helpText: "????????????????????????????????????????????????",
        label: "??????????????????????????????",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "fixedFooter",
        helpText: "????????????????????????????????????",
        label: "????????????",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "scrollContents",
        helpText: "???????????????????????????",
        label: "??????????????????",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "showReset",
        helpText: "?????????????????????????????????",
        label: "??????????????????",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "submitButtonLabel",
        helpText: "????????????????????????",
        label: "??????????????????",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "resetButtonLabel",
        helpText: "????????????????????????",
        label: "??????????????????",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
    ],
  },
  {
    sectionName: "??????",
    children: [
      {
        propertyName: "onSubmit",
        helpText: "???????????????????????????",
        label: "onSubmit",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
      },
    ],
  },
];

const generateButtonStyleControlsV2For = (prefix: string) => [
  {
    sectionName: "??????",
    collapsible: false,
    children: [
      {
        propertyName: `${prefix}.buttonColor`,
        helpText: "??????????????????",
        label: "????????????",
        controlType: "COLOR_PICKER",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: `${prefix}.buttonVariant`,
        label: "????????????",
        controlType: "DROP_DOWN",
        helpText: "????????????????????????",
        options: [
          {
            label: "?????????",
            value: ButtonVariantTypes.PRIMARY,
          },
          {
            label: "????????????",
            value: ButtonVariantTypes.SECONDARY,
          },
          {
            label: "????????????",
            value: ButtonVariantTypes.TERTIARY,
          },
        ],
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
          params: {
            allowedValues: [
              ButtonVariantTypes.PRIMARY,
              ButtonVariantTypes.SECONDARY,
              ButtonVariantTypes.TERTIARY,
            ],
            default: ButtonVariantTypes.PRIMARY,
          },
        },
      },
      {
        propertyName: `${prefix}.borderRadius`,
        label: "????????????",
        helpText: "??????????????????",
        controlType: "BORDER_RADIUS_OPTIONS",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: `${prefix}.boxShadow`,
        label: "??????",
        helpText: "??????????????????",
        controlType: "BOX_SHADOW_OPTIONS",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
        },
      },
    ],
  },
  {
    sectionName: "????????????",
    collapsible: false,
    children: [
      {
        propertyName: `${prefix}.iconName`,
        label: "??????",
        helpText: "??????????????????",
        controlType: "ICON_SELECT",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        updateHook: (
          props: ButtonWidgetProps,
          propertyPath: string,
          propertyValue: string,
        ) => {
          const propertiesToUpdate = [{ propertyPath, propertyValue }];
          if (!props.iconAlign) {
            propertiesToUpdate.push({
              propertyPath: `${prefix}.iconAlign`,
              propertyValue: Alignment.LEFT,
            });
          }
          return propertiesToUpdate;
        },
        validation: {
          type: ValidationTypes.TEXT,
        },
      },
      {
        propertyName: `${prefix}.iconAlign`,
        label: "??????",
        helpText: "??????????????????????????????",
        controlType: "ICON_TABS",
        options: [
          {
            icon: "VERTICAL_LEFT",
            value: "left",
          },
          {
            icon: "VERTICAL_RIGHT",
            value: "right",
          },
        ],
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
          params: {
            allowedValues: ["center", "left", "right"],
          },
        },
      },
      {
        propertyName: `${prefix}.placement`,
        label: "????????????",
        controlType: "DROP_DOWN",
        helpText: "????????????????????????????????????",
        options: [
          {
            label: "????????????",
            value: ButtonPlacementTypes.START,
          },
          {
            label: "????????????",
            value: ButtonPlacementTypes.BETWEEN,
          },
          {
            label: "????????????",
            value: ButtonPlacementTypes.CENTER,
          },
        ],
        defaultValue: ButtonPlacementTypes.CENTER,
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
          params: {
            allowedValues: [
              ButtonPlacementTypes.START,
              ButtonPlacementTypes.BETWEEN,
              ButtonPlacementTypes.CENTER,
            ],
            default: ButtonPlacementTypes.CENTER,
          },
        },
      },
    ],
  },
];

export const styleConfig = [
  {
    sectionName: "????????????",
    children: [
      {
        propertyName: "backgroundColor",
        helpText: "?????? html ???????????????HEX???RGB ?????? RGBA ???",
        placeholderText: "#FFFFFF / Gray / rgb(255, 99, 71)",
        label: "????????????",
        controlType: "COLOR_PICKER",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "borderColor",
        helpText: "?????? html ???????????????HEX???RGB ?????? RGBA ???",
        placeholderText: "#FFFFFF / Gray / rgb(255, 99, 71)",
        label: "????????????",
        controlType: "COLOR_PICKER",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
    ],
  },
  {
    sectionName: "????????????",
    children: [
      {
        propertyName: "borderWidth",
        helpText: "??????????????????",
        label: "????????????",
        placeholderText: "??? px ?????????",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.NUMBER },
      },
      {
        propertyName: "borderRadius",
        helpText: "Enter value for border radius",
        label: "????????????",
        controlType: "BORDER_RADIUS_OPTIONS",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "boxShadow",
        label: "??????",
        helpText: "??????????????????",
        controlType: "BOX_SHADOW_OPTIONS",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
    ],
  },
  {
    sectionName: "??????????????????",
    children: generateButtonStyleControlsV2For("submitButtonStyles"),
  },
  {
    sectionName: "??????????????????",
    children: generateButtonStyleControlsV2For("resetButtonStyles"),
    dependencies: ["showReset"],
    hidden: (props: JSONFormWidgetProps) => !props.showReset,
  },
];

export default [
  {
    sectionName: "??????",
    children: [
      {
        propertyName: "title",
        label: "??????",
        helpText: "????????????",
        controlType: "INPUT_TEXT",
        placeholderText: "Update Order",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "sourceData",
        helpText: "?????? JSON ??????",
        label: "?????????",
        controlType: "INPUT_TEXT",
        placeholderText: '{ "name": "John", "age": 24 }',
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: sourceDataValidationFn,
            expected: {
              type: "JSON",
              example: `{ "name": "John Doe", "age": 29 }`,
              autocompleteDataType: AutocompleteDataType.OBJECT,
            },
          },
        },
        evaluationSubstitutionType: EvaluationSubstitutionType.SMART_SUBSTITUTE,
      },
      {
        propertyName: "autoGenerateForm",
        helpText:
          "???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????",
        label: "??????????????????",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        customJSControl: "INPUT_TEXT",
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "generateFormButton",
        label: "",
        controlType: "BUTTON",
        isJSConvertible: false,
        isBindProperty: false,
        buttonLabel: "????????????",
        onClick: onGenerateFormClick,
        isDisabled: generateFormCTADisabled,
        isTriggerProperty: false,
        dependencies: [
          "autoGenerateForm",
          "schema",
          "fieldLimitExceeded",
          "childStylesheet",
        ],
        evaluatedDependencies: ["sourceData"],
      },
      {
        propertyName: `schema.${ROOT_SCHEMA_KEY}.children`,
        helpText: "????????????",
        label: "????????????",
        controlType: "FIELD_CONFIGURATION",
        isBindProperty: false,
        isTriggerProperty: false,
        panelConfig,
        dependencies: ["schema", "childStylesheet"],
      },
      {
        propertyName: "disabledWhenInvalid",
        helpText: "????????????????????????????????????????????????",
        label: "??????????????????????????????",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "animateLoading",
        label: "?????????????????????",
        controlType: "SWITCH",
        helpText: "????????????????????????????????????????????????",
        defaultValue: true,
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "fixedFooter",
        helpText: "????????????????????????????????????",
        label: "????????????",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "isVisible",
        helpText: "?????????????????????/??????",
        label: "????????????",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "scrollContents",
        helpText: "???????????????????????????",
        label: "??????????????????",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "showReset",
        helpText: "?????????????????????????????????",
        label: "??????????????????",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "submitButtonLabel",
        helpText: "????????????????????????",
        label: "??????????????????",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "resetButtonLabel",
        helpText: "????????????????????????",
        label: "??????????????????",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
    ],
  },
  {
    sectionName: "??????",
    children: [
      {
        propertyName: "onSubmit",
        helpText: "???????????????????????????",
        label: "onSubmit",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
      },
    ],
  },
  {
    sectionName: "????????????",
    isDefaultOpen: false,
    children: [
      {
        propertyName: "backgroundColor",
        helpText: "?????? html ???????????????HEX???RGB ?????? RGBA ???",
        placeholderText: "#FFFFFF / Gray / rgb(255, 99, 71)",
        label: "????????????",
        controlType: "COLOR_PICKER",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "borderColor",
        helpText: "?????? html ???????????????HEX???RGB ?????? RGBA ???",
        placeholderText: "#FFFFFF / Gray / rgb(255, 99, 71)",
        label: "????????????",
        controlType: "COLOR_PICKER",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "borderWidth",
        helpText: "??????????????????",
        label: "????????????",
        placeholderText: "??? px ?????????",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.NUMBER },
      },
      {
        propertyName: "borderRadius",
        helpText: "Enter value for border radius",
        label: "????????????",
        controlType: "BORDER_RADIUS_OPTIONS",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        propertyName: "boxShadow",
        label: "??????",
        helpText: "??????????????????",
        controlType: "BOX_SHADOW_OPTIONS",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
    ],
  },
  {
    sectionName: "??????????????????",
    isDefaultOpen: false,
    children: generateButtonStyleControlsFor("submitButtonStyles"),
  },
  {
    sectionName: "??????????????????",
    isDefaultOpen: false,
    children: generateButtonStyleControlsFor("resetButtonStyles"),
    dependencies: ["showReset"],
    hidden: (props: JSONFormWidgetProps) => !props.showReset,
  },
];
