import React, { useState } from "react";
import { KeyboardTypeOptions } from "react-native";
import {
  FormControl,
  FormControlLabel,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { AlertCircleIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";

interface AuthFormProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  type?: "text" | "password";
  errorMessage?: string | null;
  helperText?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "sentences" | "none" | "words" | "characters";
  editable?: boolean;
}

export function AuthForm({
  label,
  value,
  onChangeText,
  placeholder,
  type = "text",
  errorMessage,
  helperText,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: AuthFormProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isInvalid = !!errorMessage;

  const getBorderColor = () => {
    if (isInvalid) return "#EF4444";
    if (isFocused) return "#3BA935";
    return "#D1D5DB";
  };

  const baseStyle =
    "px-0 bg-transparent border-t-0 border-x-0 border-b rounded-none h-12";

  return (
    <FormControl isInvalid={isInvalid} size="md" className="mb-6">
      <FormControlLabel>
        <FormControlLabelText className="uppercase font-semibold text-sm">
          {label}
        </FormControlLabelText>
      </FormControlLabel>

      <Input
        className={baseStyle}
        size="lg"
        style={{ borderColor: getBorderColor() }}
      >
        <InputField
          className="px-0 leading-none placeholder:text-gray-400"
          type={type}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </Input>

      {!isInvalid && helperText && (
        <FormControlHelper className="mt-2">
          <FormControlHelperText className="text-gray-500 text-xs">
            {helperText}
          </FormControlHelperText>
        </FormControlHelper>
      )}

      <FormControlError className="mt-2">
        <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
        <FormControlErrorText className="text-red-500 ml-2">
          {errorMessage}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
}
