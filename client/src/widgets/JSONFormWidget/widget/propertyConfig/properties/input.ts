import { AutocompleteDataType } from "utils/autocomplete/TernServer";
import { CurrencyDropdownOptions } from "widgets/CurrencyInputWidget/component/CurrencyCodeDropdown";
import { FieldType, INPUT_TYPES } from "widgets/JSONFormWidget/constants";
import {
  getAutocompleteProperties,
  getSchemaItem,
  HiddenFnParams,
} from "../helper";
import { InputFieldProps } from "widgets/JSONFormWidget/fields/InputField";
import { ISDCodeDropdownOptions } from "widgets/PhoneInputWidget/component/ISDCodeDropdown";
import { JSONFormWidgetProps } from "../..";
import {
  ValidationResponse,
  ValidationTypes,
} from "constants/WidgetValidation";
import { ICON_NAMES } from "widgets/constants";

function defaultValueValidation(
  value: any,
  props: JSONFormWidgetProps,
  lodash: any,
  _: any,
  propertyPath: string,
): ValidationResponse {
  const propertyPathChunks = propertyPath.split(".");
  const parentPath = propertyPathChunks.slice(0, -1).join(".");
  const schemaItem = lodash.get(props, parentPath);
  const { fieldType } = schemaItem;

  if (value === null || value === undefined) {
    return {
      isValid: true,
      parsed: value,
      messages: [""],
    };
  }

  // Cannot use FieldType typing check as this whole method is passed as string and executed on worker, so it results
  // any methods/variable (closure) usage as reference error.
  // CAUTION! - make sure the correct fieldType is used here as string.
  if (fieldType === "Number Input" || fieldType === "Currency Input") {
    const parsed = Number(value);

    if (typeof value === "string") {
      if (value.trim() === "") {
        return {
          isValid: true,
          parsed: undefined,
          messages: [""],
        };
      }

      if (!Number.isFinite(parsed)) {
        return {
          isValid: false,
          parsed: undefined,
          messages: ["This value must be a number"],
        };
      }
    }

    return {
      isValid: true,
      parsed,
      messages: [""],
    };
  }

  if (lodash.isObject(value)) {
    return {
      isValid: false,
      parsed: JSON.stringify(value, null, 2),
      messages: ["This value must be string"],
    };
  }

  let parsed = value;
  const isValid = lodash.isString(parsed);
  if (!isValid) {
    try {
      parsed = lodash.toString(parsed);
    } catch (e) {
      return {
        isValid: false,
        parsed: "",
        messages: ["This value must be string"],
      };
    }
  }

  return {
    isValid,
    parsed: parsed,
    messages: [""],
  };
}

export function minValueValidation(
  min: any,
  props: JSONFormWidgetProps,
  lodash: any,
  _: any,
  propertyPath: string,
) {
  const propertyPathChunks = propertyPath.split(".");
  const parentPath = propertyPathChunks.slice(0, -1).join(".");
  const schemaItem = lodash.get(props, parentPath);
  const max = schemaItem.maxNum;
  const value = min;
  min = Number(min);

  if (lodash?.isNil(value) || value === "") {
    return {
      isValid: true,
      parsed: undefined,
      messages: [""],
    };
  } else if (!Number.isFinite(min)) {
    return {
      isValid: false,
      parsed: undefined,
      messages: ["This value must be number"],
    };
  } else if (max !== undefined && min >= max) {
    return {
      isValid: false,
      parsed: undefined,
      messages: ["This value must be lesser than max value"],
    };
  } else {
    return {
      isValid: true,
      parsed: min,
      messages: [""],
    };
  }
}

export function maxValueValidation(
  max: any,
  props: JSONFormWidgetProps,
  lodash: any,
  _: any,
  propertyPath: string,
) {
  const propertyPathChunks = propertyPath.split(".");
  const parentPath = propertyPathChunks.slice(0, -1).join(".");
  const schemaItem = lodash.get(props, parentPath);
  const min = schemaItem.minNum;
  const value = max;
  max = Number(max);

  if (lodash?.isNil(value) || value === "") {
    return {
      isValid: true,
      parsed: undefined,
      messages: [""],
    };
  } else if (!Number.isFinite(max)) {
    return {
      isValid: false,
      parsed: undefined,
      messages: ["This value must be number"],
    };
  } else if (min !== undefined && max <= min) {
    return {
      isValid: false,
      parsed: undefined,
      messages: ["This value must be greater than min value"],
    };
  } else {
    return {
      isValid: true,
      parsed: Number(max),
      messages: [""],
    };
  }
}

const PROPERTIES = {
  general: [
    {
      helpText: "?????????????????????????????????",
      propertyName: "defaultValue",
      label: "?????????",
      controlType: "JSON_FORM_COMPUTE_VALUE",
      placeholderText: "John Wick",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.FUNCTION,
        params: {
          fn: defaultValueValidation,
          expected: {
            type: "string or number",
            example: `John | 123`,
            autocompleteDataType: AutocompleteDataType.STRING,
          },
        },
      },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
      dependencies: ["schema"],
    },
    {
      propertyName: "allowCurrencyChange",
      label: "??????????????????",
      helpText: "??????????????????????????????",
      controlType: "SWITCH",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.BOOLEAN },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(FieldType.CURRENCY_INPUT),
      dependencies: ["schema"],
    },
    {
      helpText: "??????????????????",
      propertyName: "currencyCountryCode",
      label: "??????",
      enableSearch: true,
      dropdownHeight: "195px",
      controlType: "DROP_DOWN",
      searchPlaceholderText: "??????????????????????????????",
      options: CurrencyDropdownOptions,
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(FieldType.CURRENCY_INPUT),
      dependencies: ["schema"],
      isBindProperty: false,
      isTriggerProperty: false,
    },
    {
      helpText: "?????????????????????????????????",
      propertyName: "decimalsInCurrency",
      label: "?????????",
      controlType: "DROP_DOWN",
      options: [
        {
          label: "0",
          value: 0,
        },
        {
          label: "1",
          value: 1,
        },
        {
          label: "2",
          value: 2,
        },
      ],
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(FieldType.CURRENCY_INPUT),
      dependencies: ["schema"],
      isBindProperty: false,
      isTriggerProperty: false,
    },
    {
      propertyName: "allowDialCodeChange",
      label: "????????????????????????",
      helpText: "?????????????????????",
      controlType: "SWITCH",
      isJSConvertible: false,
      isBindProperty: true,
      isTriggerProperty: false,
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(
          FieldType.PHONE_NUMBER_INPUT,
        ),
      dependencies: ["schema"],
      validation: { type: ValidationTypes.BOOLEAN },
    },
    {
      helpText: "?????????????????????????????????",
      propertyName: "dialCode",
      label: "??????????????????",
      enableSearch: true,
      dropdownHeight: "195px",
      controlType: "DROP_DOWN",
      searchPlaceholderText: "?????????????????????????????????",
      options: ISDCodeDropdownOptions,
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(
          FieldType.PHONE_NUMBER_INPUT,
        ),
      dependencies: ["schema"],
      isBindProperty: false,
      isTriggerProperty: false,
    },
    {
      helpText: "??????????????????????????????",
      propertyName: "maxChars",
      label: "???????????????",
      controlType: "JSON_FORM_COMPUTE_VALUE",
      placeholderText: "255",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.NUMBER },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(FieldType.TEXT_INPUT),
      dependencies: ["schema"],
    },
    {
      helpText: "????????????????????????",
      propertyName: "minNum",
      label: "??????????????????",
      controlType: "INPUT_TEXT",
      placeholderText: "1",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.FUNCTION,
        params: {
          fn: minValueValidation,
          expected: {
            type: "number",
            example: `1`,
            autocompleteDataType: AutocompleteDataType.NUMBER,
          },
        },
      },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(FieldType.NUMBER_INPUT),
      dependencies: ["schema"],
    },
    {
      helpText: "????????????????????????",
      propertyName: "maxNum",
      label: "??????????????????",
      controlType: "INPUT_TEXT",
      placeholderText: "100",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.FUNCTION,
        params: {
          fn: maxValueValidation,
          expected: {
            type: "number",
            example: `100`,
            autocompleteDataType: AutocompleteDataType.NUMBER,
          },
        },
      },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(FieldType.NUMBER_INPUT),
      dependencies: ["schema"],
    },
    {
      helpText: "?????????????????????????????????????????????????????????",
      propertyName: "regex",
      label: "????????????",
      controlType: "JSON_FORM_COMPUTE_VALUE",
      placeholderText: "^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$",
      inputType: "TEXT",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.REGEX },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
      dependencies: ["schema"],
    },
    {
      helpText: "?????? JS ???????????????????????????????????????",
      propertyName: "validation",
      label: "????????????",
      controlType: "JSON_FORM_COMPUTE_VALUE",
      placeholderText: "{{ Input1.text.length > 0 }}",
      inputType: "TEXT",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.BOOLEAN, params: { default: true } },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
      dependencies: ["schema"],
    },
    {
      helpText: "?????????????????????????????????????????????????????????",
      propertyName: "errorMessage",
      label: "????????????",
      controlType: "JSON_FORM_COMPUTE_VALUE",
      placeholderText: "??????????????????",
      inputType: "TEXT",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
      dependencies: ["schema"],
    },
    {
      helpText: "????????????????????????????????????",
      propertyName: "placeholderText",
      label: "?????????",
      controlType: "JSON_FORM_COMPUTE_VALUE",
      placeholderText: "?????????",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
      dependencies: ["schema"],
    },
    {
      propertyName: "isSpellCheck",
      label: "????????????",
      helpText: "????????????????????????",
      controlType: "SWITCH",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.BOOLEAN },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(FieldType.TEXT_INPUT),
      dependencies: ["schema"],
    },
    {
      propertyName: "iconName",
      label: "??????",
      helpText: "????????????????????????",
      controlType: "ICON_SELECT",
      isBindProperty: true,
      isTriggerProperty: false,
      isJSConvertible: true,
      validation: {
        type: ValidationTypes.TEXT,
        params: {
          allowedValues: ICON_NAMES,
        },
      },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotIncludes([
          FieldType.TEXT_INPUT,
          FieldType.EMAIL_INPUT,
          FieldType.PASSWORD_INPUT,
          FieldType.NUMBER_INPUT,
        ]),
      dependencies: ["schema"],
    },
    {
      propertyName: "iconAlign",
      label: "????????????",
      helpText: "????????????????????????????????????",
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
      isBindProperty: false,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem<InputFieldProps["schemaItem"]>(...args).compute(
          (schemaItem) => !schemaItem.iconName,
        ),
      dependencies: ["schema"],
    },
  ],
  actions: [
    {
      propertyName: "onTextChanged",
      helpText: "???????????????????????????",
      label: "onTextChanged",
      controlType: "ACTION_SELECTOR",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
      additionalAutoComplete: getAutocompleteProperties,
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
      dependencies: ["schema"],
    },
    {
      propertyName: "onEnterKeyPress",
      helpText: "???????????????????????????????????????",
      label: "onEnterKeyPress",
      controlType: "ACTION_SELECTOR",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
      additionalAutoComplete: getAutocompleteProperties,
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
      dependencies: ["schema"],
    },
  ],

  content: {
    data: [
      {
        propertyName: "defaultValue",
        helpText: "?????????????????????????????????",
        label: "?????????",
        controlType: "JSON_FORM_COMPUTE_VALUE",
        placeholderText: "John Wick",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: defaultValueValidation,
            expected: {
              type: "string or number",
              example: `John | 123`,
              autocompleteDataType: AutocompleteDataType.STRING,
            },
          },
        },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
        dependencies: ["schema"],
      },
      {
        propertyName: "dialCode",
        helpText: "?????????????????????????????????",
        label: "??????????????????",
        enableSearch: true,
        dropdownHeight: "195px",
        controlType: "DROP_DOWN",
        searchPlaceholderText: "?????????????????????????????????",
        options: ISDCodeDropdownOptions,
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotMatches(
            FieldType.PHONE_NUMBER_INPUT,
          ),
        dependencies: ["schema"],
        isBindProperty: false,
        isTriggerProperty: false,
      },
      {
        propertyName: "currencyCountryCode",
        helpText: "??????????????????",
        label: "??????",
        enableSearch: true,
        dropdownHeight: "195px",
        controlType: "DROP_DOWN",
        searchPlaceholderText: "??????????????????????????????",
        options: CurrencyDropdownOptions,
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotMatches(FieldType.CURRENCY_INPUT),
        dependencies: ["schema"],
        isBindProperty: false,
        isTriggerProperty: false,
      },
      {
        propertyName: "allowDialCodeChange",
        label: "????????????????????????",
        helpText: "?????????????????????",
        controlType: "SWITCH",
        isJSConvertible: false,
        isBindProperty: true,
        isTriggerProperty: false,
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotMatches(
            FieldType.PHONE_NUMBER_INPUT,
          ),
        dependencies: ["schema"],
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "allowCurrencyChange",
        label: "??????????????????",
        helpText: "??????????????????????????????",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotMatches(FieldType.CURRENCY_INPUT),
        dependencies: ["schema"],
      },
      {
        propertyName: "decimalsInCurrency",
        helpText: "?????????????????????????????????",
        label: "Decimals Allowed",
        controlType: "DROP_DOWN",
        options: [
          {
            label: "0",
            value: 0,
          },
          {
            label: "1",
            value: 1,
          },
          {
            label: "2",
            value: 2,
          },
        ],
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotMatches(FieldType.CURRENCY_INPUT),
        dependencies: ["schema"],
        isBindProperty: false,
        isTriggerProperty: false,
      },
    ],
    general: [
      {
        propertyName: "placeholderText",
        helpText: "????????????????????????????????????",
        label: "?????????",
        controlType: "JSON_FORM_COMPUTE_VALUE",
        placeholderText: "?????????",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
        dependencies: ["schema"],
      },
    ],
    validation: [
      {
        propertyName: "isRequired",
        label: "??????",
        helpText: "??????????????????",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        customJSControl: "JSON_FORM_COMPUTE_VALUE",
        validation: { type: ValidationTypes.BOOLEAN },
        hidden: (...args: HiddenFnParams) => {
          return getSchemaItem(...args).compute(
            (schemaItem) =>
              schemaItem.fieldType === FieldType.OBJECT ||
              schemaItem.fieldType === FieldType.ARRAY,
          );
        },
        dependencies: ["schema", "sourceData"],
      },
      {
        propertyName: "maxChars",
        helpText: "??????????????????????????????",
        label: "???????????????",
        controlType: "JSON_FORM_COMPUTE_VALUE",
        placeholderText: "255",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.NUMBER },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotMatches(FieldType.TEXT_INPUT),
        dependencies: ["schema"],
      },
      {
        propertyName: "minNum",
        helpText: "????????????????????????",
        label: "??????????????????",
        controlType: "INPUT_TEXT",
        placeholderText: "1",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: minValueValidation,
            expected: {
              type: "number",
              example: `1`,
              autocompleteDataType: AutocompleteDataType.NUMBER,
            },
          },
        },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotMatches(FieldType.NUMBER_INPUT),
        dependencies: ["schema"],
      },
      {
        propertyName: "maxNum",
        helpText: "????????????????????????",
        label: "??????????????????",
        controlType: "INPUT_TEXT",
        placeholderText: "100",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: maxValueValidation,
            expected: {
              type: "number",
              example: `100`,
              autocompleteDataType: AutocompleteDataType.NUMBER,
            },
          },
        },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotMatches(FieldType.NUMBER_INPUT),
        dependencies: ["schema"],
      },
      {
        propertyName: "regex",
        helpText: "?????????????????????????????????????????????????????????",
        label: "????????????",
        controlType: "JSON_FORM_COMPUTE_VALUE",
        placeholderText: "^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$",
        inputType: "TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.REGEX },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
        dependencies: ["schema"],
      },
      {
        propertyName: "validation",
        helpText: "?????? JS ???????????????????????????????????????",
        label: "????????????",
        controlType: "JSON_FORM_COMPUTE_VALUE",
        placeholderText: "{{ Input1.text.length > 0 }}",
        inputType: "TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.BOOLEAN,
          params: { default: true },
        },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
        dependencies: ["schema"],
      },
      {
        propertyName: "errorMessage",
        helpText: "?????????????????????????????????????????????????????????",
        label: "????????????",
        controlType: "JSON_FORM_COMPUTE_VALUE",
        placeholderText: "??????????????????",
        inputType: "TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
        dependencies: ["schema"],
      },
      {
        propertyName: "isSpellCheck",
        label: "????????????",
        helpText: "????????????????????????",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotMatches(FieldType.TEXT_INPUT),
        dependencies: ["schema"],
      },
    ],
    events: [
      {
        propertyName: "onTextChanged",
        helpText: "???????????????????????????",
        label: "onTextChanged",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
        additionalAutoComplete: getAutocompleteProperties,
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
        dependencies: ["schema"],
      },
      {
        propertyName: "onEnterKeyPress",
        helpText: "???????????????????????????????????????",
        label: "onEnterKeyPress",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
        additionalAutoComplete: getAutocompleteProperties,
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotIncludes(INPUT_TYPES),
        dependencies: ["schema"],
      },
    ],
  },
  style: {
    icon: [
      {
        propertyName: "iconName",
        label: "??????",
        helpText: "????????????????????????",
        controlType: "ICON_SELECT",
        isBindProperty: true,
        isTriggerProperty: false,
        isJSConvertible: true,
        validation: {
          type: ValidationTypes.TEXT,
          params: {
            allowedValues: ICON_NAMES,
          },
        },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem(...args).fieldTypeNotIncludes([
            FieldType.TEXT_INPUT,
            FieldType.EMAIL_INPUT,
            FieldType.PASSWORD_INPUT,
            FieldType.NUMBER_INPUT,
          ]),
        dependencies: ["schema"],
      },
      {
        propertyName: "iconAlign",
        label: "????????????",
        helpText: "????????????????????????",
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
        isBindProperty: false,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
        hidden: (...args: HiddenFnParams) =>
          getSchemaItem<InputFieldProps["schemaItem"]>(...args).compute(
            (schemaItem) => !schemaItem.iconName,
          ),
        dependencies: ["schema"],
      },
    ],
  },
};

export default PROPERTIES;
