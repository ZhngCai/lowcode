import React from "react";
import BaseWidget, { WidgetProps, WidgetState } from "widgets/BaseWidget";
import { Alignment } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import { WidgetType, RenderModes, TextSize } from "constants/WidgetConstants";
import InputComponent, { InputComponentProps } from "../component";
import {
  EventType,
  ExecutionResult,
} from "constants/AppsmithActionConstants/ActionConstants";
import {
  ValidationTypes,
  ValidationResponse,
} from "constants/WidgetValidation";
import {
  createMessage,
  FIELD_REQUIRED_ERROR,
  INPUT_DEFAULT_TEXT_MAX_CHAR_ERROR,
} from "@appsmith/constants/messages";
import { DerivedPropertiesMap } from "utils/WidgetFactory";
import { InputType, InputTypes } from "../constants";
import { GRID_DENSITY_MIGRATION_V1 } from "widgets/constants";
import { ISDCodeDropdownOptions } from "../component/ISDCodeDropdown";
import { CurrencyDropdownOptions } from "../component/CurrencyCodeDropdown";
import { AutocompleteDataType } from "utils/autocomplete/TernServer";
import {
  formatCurrencyNumber,
  getDecimalSeparator,
  getLocale,
} from "../component/utilities";
import { LabelPosition } from "components/constants";

export function defaultValueValidation(
  value: any,
  props: InputWidgetProps,
  _?: any,
): ValidationResponse {
  const { inputType } = props;
  if (
    inputType === "INTEGER" ||
    inputType === "NUMBER" ||
    inputType === "CURRENCY" ||
    inputType === "PHONE_NUMBER"
  ) {
    let parsed: number | undefined = Number(value);

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

    if (isNaN(parsed)) {
      parsed = undefined;
    }

    return {
      isValid: true,
      parsed,
      messages: [""],
    };
  }
  if (_.isObject(value)) {
    return {
      isValid: false,
      parsed: JSON.stringify(value, null, 2),
      messages: ["This value must be string"],
    };
  }
  let parsed = value;
  const isValid = _.isString(parsed);
  if (!isValid) {
    try {
      parsed = _.toString(parsed);
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

class InputWidget extends BaseWidget<InputWidgetProps, WidgetState> {
  constructor(props: InputWidgetProps) {
    super(props);
    this.state = {
      text: props.text,
    };
  }
  static getPropertyPaneConfig() {
    return [
      {
        sectionName: "??????",
        children: [
          {
            helpText: "?????????????????????",
            propertyName: "inputType",
            label: "????????????",
            controlType: "DROP_DOWN",
            options: [
              {
                label: "??????",
                value: "TEXT",
              },
              {
                label: "??????",
                value: "NUMBER",
              },
              {
                label: "??????",
                value: "PASSWORD",
              },
              {
                label: "??????",
                value: "EMAIL",
              },
              {
                label: "??????",
                value: "CURRENCY",
              },
              {
                label: "?????????",
                value: "PHONE_NUMBER",
              },
            ],
            isBindProperty: false,
            isTriggerProperty: false,
          },
          {
            propertyName: "allowCurrencyChange",
            label: "??????????????????",
            helpText: "??????????????????????????????",
            controlType: "SWITCH",
            isJSConvertible: false,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
            hidden: (props: InputWidgetProps) => {
              return props.inputType !== InputTypes.CURRENCY;
            },
            dependencies: ["inputType"],
          },
          {
            helpText: "?????????????????????????????????",
            propertyName: "phoneNumberCountryCode",
            label: "??????????????????",
            enableSearch: true,
            dropdownHeight: "195px",
            controlType: "DROP_DOWN",
            searchPlaceholderText: "?????????????????????????????????",
            options: ISDCodeDropdownOptions,
            hidden: (props: InputWidgetProps) => {
              return props.inputType !== InputTypes.PHONE_NUMBER;
            },
            dependencies: ["inputType"],
            isBindProperty: false,
            isTriggerProperty: false,
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
            hidden: (props: InputWidgetProps) => {
              return props.inputType !== InputTypes.CURRENCY;
            },
            dependencies: ["inputType"],
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
                label: "1",
                value: 1,
              },
              {
                label: "2",
                value: 2,
              },
            ],
            hidden: (props: InputWidgetProps) => {
              return props.inputType !== InputTypes.CURRENCY;
            },
            dependencies: ["inputType"],
            isBindProperty: false,
            isTriggerProperty: false,
          },
          {
            helpText: "??????????????????????????????",
            propertyName: "maxChars",
            label: "???????????????",
            controlType: "INPUT_TEXT",
            placeholderText: "255",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
            hidden: (props: InputWidgetProps) => {
              return props.inputType !== InputTypes.TEXT;
            },
            dependencies: ["inputType"],
          },
          {
            helpText: "??????????????????????????????????????????????????????????????????????????????",
            propertyName: "defaultText",
            label: "?????????",
            controlType: "INPUT_TEXT",
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
            dependencies: ["inputType"],
          },
          {
            helpText: "?????????????????????????????????????????????????????????",
            propertyName: "regex",
            label: "????????????",
            controlType: "INPUT_TEXT",
            placeholderText: "^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$",
            inputType: "TEXT",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.REGEX },
          },
          {
            helpText: "?????? JS ???????????????????????????????????????",
            propertyName: "validation",
            label: "????????????",
            controlType: "INPUT_TEXT",
            placeholderText: "{{ Input1.text.length > 0 }}",
            inputType: "TEXT",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "?????????????????????????????????????????????????????????",
            propertyName: "errorMessage",
            label: "????????????",
            controlType: "INPUT_TEXT",
            placeholderText: "??????????????????",
            inputType: "TEXT",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "????????????????????????????????????",
            propertyName: "placeholderText",
            label: "?????????",
            controlType: "INPUT_TEXT",
            placeholderText: "?????????",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "?????????????????????????????????????????????",
            propertyName: "tooltip",
            label: "??????",
            controlType: "INPUT_TEXT",
            placeholderText: "???????????????6???",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "isRequired",
            label: "??????",
            helpText: "??????????????????",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "?????????????????????/??????",
            propertyName: "isVisible",
            label: "????????????",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "?????????????????????",
            propertyName: "isDisabled",
            label: "??????",
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
            helpText: "???????????????????????????",
            propertyName: "resetOnSubmit",
            label: "???????????????",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "?????????????????????????????????",
            propertyName: "autoFocus",
            label: "????????????",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "isSpellCheck",
            label: "????????????",
            helpText: "????????????????????????",
            controlType: "SWITCH",
            isJSConvertible: false,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
            hidden: (props: InputWidgetProps) => {
              return props.inputType !== InputTypes.TEXT;
            },
            dependencies: ["inputType"],
          },
        ],
      },
      {
        sectionName: "??????",
        children: [
          {
            helpText: "????????????????????????",
            propertyName: "label",
            label: "??????",
            controlType: "INPUT_TEXT",
            placeholderText: "?????????",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "????????????????????????",
            propertyName: "labelPosition",
            label: "??????",
            controlType: "DROP_DOWN",
            options: [
              { label: "???", value: LabelPosition.Left },
              { label: "???", value: LabelPosition.Top },
              { label: "??????", value: LabelPosition.Auto },
            ],
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "?????????????????????????????????",
            propertyName: "labelAlignment",
            label: "??????",
            controlType: "LABEL_ALIGNMENT_OPTIONS",
            options: [
              {
                icon: "LEFT_ALIGN",
                value: Alignment.LEFT,
              },
              {
                icon: "RIGHT_ALIGN",
                value: Alignment.RIGHT,
              },
            ],
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hidden: (props: InputWidgetProps) =>
              props.labelPosition !== LabelPosition.Left,
            dependencies: ["labelPosition"],
          },
          {
            helpText: "?????????????????????????????????",
            propertyName: "labelWidth",
            label: "????????????????????????",
            controlType: "NUMERIC_INPUT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            min: 0,
            validation: {
              type: ValidationTypes.NUMBER,
              params: {
                natural: true,
              },
            },
            hidden: (props: InputWidgetProps) =>
              props.labelPosition !== LabelPosition.Left,
            dependencies: ["labelPosition"],
          },
        ],
      },
      {
        sectionName: "??????",
        children: [
          {
            helpText: "???????????????????????????",
            propertyName: "onTextChanged",
            label: "onTextChanged",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          {
            helpText: "???????????????????????????????????????",
            propertyName: "onSubmit",
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
        children: [
          {
            propertyName: "labelTextColor",
            label: "????????????",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
              params: {
                regex: /^(?![<|{{]).+/,
              },
            },
          },
          {
            propertyName: "labelTextSize",
            label: "????????????",
            controlType: "DROP_DOWN",
            defaultValue: "0.875rem",
            options: [
              {
                label: "S",
                value: "0.875rem",
                subText: "0.875rem",
              },
              {
                label: "M",
                value: "1rem",
                subText: "1rem",
              },
              {
                label: "L",
                value: "1.25rem",
                subText: "1.25rem",
              },
              {
                label: "XL",
                value: "1.875rem",
                subText: "1.875rem",
              },
              {
                label: "XXL",
                value: "3rem",
                subText: "3rem",
              },
              {
                label: "3XL",
                value: "3.75rem",
                subText: "3.75rem",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "labelStyle",
            label: "????????????",
            controlType: "BUTTON_TABS",
            options: [
              {
                icon: "BOLD_FONT",
                value: "BOLD",
              },
              {
                icon: "ITALICS_FONT",
                value: "ITALIC",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
      {
        sectionName: "????????????",
        hidden: (props: InputWidgetProps) => {
          const { inputType } = props;
          return inputType === "CURRENCY" || inputType === "PHONE_NUMBER";
        },
        dependencies: ["inputType"],
        children: [
          {
            propertyName: "iconName",
            label: "??????",
            helpText: "????????????????????????",
            controlType: "ICON_SELECT",
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
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
            hidden: (props: InputWidgetProps) => !props.iconName,
            dependencies: ["iconName"],
          },
        ],
      },
      {
        sectionName: "??????",
        children: [
          {
            propertyName: "backgroundColor",
            helpText: "????????????????????????",
            label: "????????????",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
    ];
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return {
      isValid: `{{
        (function(){
          if (!this.isRequired && !this.text) {
            return true
          }
          if(this.isRequired && !this.text){
            return false
          }
          if (typeof this.validation === "boolean" && !this.validation) {
            return false;
          }
          let parsedRegex = null;
          if (this.regex) {
            /*
            * break up the regexp pattern into 4 parts: given regex, regex prefix , regex pattern, regex flags
            * Example /test/i will be split into ["/test/gi", "/", "test", "gi"]
            */
            const regexParts = this.regex.match(/(\\/?)(.+)\\1([a-z]*)/i);

            if (!regexParts) {
              parsedRegex = new RegExp(this.regex);
            } else {
              /*
              * if we don't have a regex flags (gmisuy), convert provided string into regexp directly
              /*
              if (regexParts[3] && !/^(?!.*?(.).*?\\1)[gmisuy]+$/.test(regexParts[3])) {
                parsedRegex = RegExp(this.regex);
              }
              /*
              * if we have a regex flags, use it to form regexp
              */
              parsedRegex = new RegExp(regexParts[2], regexParts[3]);
            }
          }
          if (this.inputType === "EMAIL") {
            const emailRegex = new RegExp(/^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/);
            return emailRegex.test(this.text);
          }
          else if (
            this.inputType === "NUMBER" ||
            this.inputType === "INTEGER" ||
            this.inputType === "CURRENCY" ||
            this.inputType === "PHONE_NUMBER"
          ) {
            let value = this.text.split(",").join("");
            if (parsedRegex) {
              return parsedRegex.test(value);
            }
            if (this.isRequired) {
              return !(value === '' || isNaN(value));
            }

            return (value === '' || !isNaN(value || ''));
          }
          else if (this.isRequired) {
            if(this.text && this.text.length) {
              if (parsedRegex) {
                return parsedRegex.test(this.text)
              } else {
                return true;
              }
            } else {
              return false;
            }
          }
          if (parsedRegex) {
            return parsedRegex.test(this.text)
          } else {
            return true;
          }
        })()
      }}`,
      value: `{{this.text}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      text: "defaultText",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      text: undefined,
      isFocused: false,
      isDirty: false,
      selectedCurrencyType: undefined,
      selectedCountryCode: undefined,
    };
  }

  onValueChange = (value: string) => {
    this.props.updateWidgetMetaProperty("text", value, {
      triggerPropertyName: "onTextChanged",
      dynamicString: this.props.onTextChanged,
      event: {
        type: EventType.ON_TEXT_CHANGE,
      },
    });
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }
  };

  onCurrencyTypeChange = (code?: string) => {
    const currencyCountryCode = code;
    if (this.props.renderMode === RenderModes.CANVAS) {
      super.updateWidgetProperty("currencyCountryCode", currencyCountryCode);
    } else {
      this.props.updateWidgetMetaProperty(
        "selectedCurrencyCountryCode",
        currencyCountryCode,
      );
    }
  };

  onISDCodeChange = (code?: string) => {
    const countryCode = code;
    if (this.props.renderMode === RenderModes.CANVAS) {
      super.updateWidgetProperty("phoneNumberCountryCode", countryCode);
    } else {
      this.props.updateWidgetMetaProperty(
        "selectedPhoneNumberCountryCode",
        countryCode,
      );
    }
  };

  handleFocusChange = (focusState: boolean) => {
    /**
     * Reason for disabling drag on focusState: true:
     * 1. In Firefox, draggable="true" property on the parent element
     *    or <input /> itself, interferes with some <input /> element's events
     *    Bug Ref - https://bugzilla.mozilla.org/show_bug.cgi?id=800050
     *              https://bugzilla.mozilla.org/show_bug.cgi?id=1189486
     *
     *  Eg - input with draggable="true", double clicking the text; won't highlight the text
     *
     * 2. Dragging across the text (for text selection) in input won't cause the widget to drag.
     */
    this.props.updateWidgetMetaProperty("dragDisabled", focusState);
    this.props.updateWidgetMetaProperty("isFocused", focusState);
  };

  onSubmitSuccess = (result: ExecutionResult) => {
    if (result.success && this.props.resetOnSubmit) {
      this.props.updateWidgetMetaProperty("text", "", {
        triggerPropertyName: "onSubmit",
        dynamicString: this.props.onTextChanged,
        event: {
          type: EventType.ON_TEXT_CHANGE,
        },
      });
    }
  };

  handleKeyDown = (
    e:
      | React.KeyboardEvent<HTMLTextAreaElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const { isValid, onSubmit } = this.props;
    const isEnterKey = e.key === "Enter" || e.keyCode === 13;
    if (isEnterKey && onSubmit && isValid) {
      super.executeAction({
        triggerPropertyName: "onSubmit",
        dynamicString: onSubmit,
        event: {
          type: EventType.ON_SUBMIT,
          callback: this.onSubmitSuccess,
        },
      });
    }
  };

  getFormattedText = () => {
    if (this.props.isFocused || this.props.inputType !== InputTypes.CURRENCY) {
      return this.props.text !== undefined ? this.props.text : "";
    }
    if (this.props.text === "" || this.props.text === undefined) return "";
    const valueToFormat = String(this.props.text);

    const locale = getLocale();
    const decimalSeparator = getDecimalSeparator(locale);
    return formatCurrencyNumber(
      this.props.decimalsInCurrency,
      valueToFormat,
      decimalSeparator,
    );
  };

  getPageView() {
    const value = this.getFormattedText();
    let isInvalid =
      "isValid" in this.props && !this.props.isValid && !!this.props.isDirty;
    const currencyCountryCode = this.props.selectedCurrencyCountryCode
      ? this.props.selectedCurrencyCountryCode
      : this.props.currencyCountryCode;
    const phoneNumberCountryCode = this.props.selectedPhoneNumberCountryCode
      ? this.props.selectedPhoneNumberCountryCode
      : this.props.phoneNumberCountryCode;
    const conditionalProps: Partial<InputComponentProps> = {};
    conditionalProps.errorMessage = this.props.errorMessage;
    if (this.props.isRequired && value.length === 0) {
      conditionalProps.errorMessage = createMessage(FIELD_REQUIRED_ERROR);
    }
    if (this.props.inputType === "TEXT" && this.props.maxChars) {
      // pass maxChars only for Text type inputs, undefined for other types
      conditionalProps.maxChars = this.props.maxChars;
      if (
        this.props.defaultText &&
        this.props.defaultText.toString().length > this.props.maxChars
      ) {
        isInvalid = true;
        conditionalProps.errorMessage = createMessage(
          INPUT_DEFAULT_TEXT_MAX_CHAR_ERROR,
          this.props.maxChars,
        );
      }
    }
    if (this.props.maxNum) conditionalProps.maxNum = this.props.maxNum;
    if (this.props.minNum) conditionalProps.minNum = this.props.minNum;
    const minInputSingleLineHeight =
      this.props.label || this.props.tooltip
        ? // adjust height for label | tooltip extra div
          GRID_DENSITY_MIGRATION_V1 + 4
        : // GRID_DENSITY_MIGRATION_V1 used to adjust code as per new scaled canvas.
          GRID_DENSITY_MIGRATION_V1;

    return (
      <InputComponent
        accentColor={this.props.accentColor}
        allowCurrencyChange={this.props.allowCurrencyChange}
        autoFocus={this.props.autoFocus}
        backgroundColor={this.props.backgroundColor}
        borderRadius={this.props.borderRadius}
        boxShadow={this.props.boxShadow}
        // show label and Input side by side if true
        compactMode={
          !(
            (this.props.bottomRow - this.props.topRow) /
              GRID_DENSITY_MIGRATION_V1 >
            1
          )
        }
        currencyCountryCode={currencyCountryCode}
        decimalsInCurrency={this.props.decimalsInCurrency}
        defaultValue={this.props.defaultText}
        disableNewLineOnPressEnterKey={!!this.props.onSubmit}
        disabled={this.props.isDisabled}
        iconAlign={this.props.iconAlign}
        iconName={this.props.iconName}
        inputType={this.props.inputType}
        isInvalid={isInvalid}
        isLoading={this.props.isLoading}
        label={this.props.label}
        labelAlignment={this.props.labelAlignment}
        labelPosition={this.props.labelPosition}
        labelStyle={this.props.labelStyle}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        labelWidth={(this.props.labelWidth || 0) * this.props.parentColumnSpace}
        multiline={
          (this.props.bottomRow - this.props.topRow) /
            minInputSingleLineHeight >
            1 && this.props.inputType === "TEXT"
        }
        onCurrencyTypeChange={this.onCurrencyTypeChange}
        onFocusChange={this.handleFocusChange}
        onISDCodeChange={this.onISDCodeChange}
        onKeyDown={this.handleKeyDown}
        onValueChange={this.onValueChange}
        phoneNumberCountryCode={phoneNumberCountryCode}
        placeholder={this.props.placeholderText}
        showError={!!this.props.isFocused}
        spellCheck={!!this.props.isSpellCheck}
        stepSize={1}
        tooltip={this.props.tooltip}
        value={value}
        widgetId={this.props.widgetId}
        {...conditionalProps}
      />
    );
  }

  static getWidgetType(): WidgetType {
    return "INPUT_WIDGET";
  }
}

export interface InputValidator {
  validationRegex: string;
  errorMessage: string;
}
export interface InputWidgetProps extends WidgetProps {
  inputType: InputType;
  currencyCountryCode?: string;
  noOfDecimals?: number;
  allowCurrencyChange?: boolean;
  phoneNumberCountryCode?: string;
  decimalsInCurrency?: number;
  defaultText?: string | number;
  tooltip?: string;
  isDisabled?: boolean;
  validation: boolean;
  text: string;
  regex?: string;
  errorMessage?: string;
  placeholderText?: string;
  maxChars?: number;
  minNum?: number;
  maxNum?: number;
  onTextChanged?: string;
  label: string;
  labelPosition?: LabelPosition;
  labelAlignment?: Alignment;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  labelWidth?: number;
  inputValidators: InputValidator[];
  isValid: boolean;
  focusIndex?: number;
  isAutoFocusEnabled?: boolean;
  isRequired?: boolean;
  isFocused?: boolean;
  isDirty?: boolean;
  autoFocus?: boolean;
  iconName?: IconName;
  iconAlign?: Omit<Alignment, "center">;
  onSubmit?: string;
  backgroundColor: string;
  borderRadius: string;
  boxShadow?: string;
  primaryColor: string;
}

export default InputWidget;
