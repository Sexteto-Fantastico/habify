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
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";

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
  const [showPassword, setShowPassword] = useState(false);
  
  const isInvalid = !!errorMessage;

  let borderColorClass = "border-outline-300";
  
  if (isInvalid) {
    borderColorClass = "border-error-500";
  } else if (isFocused) {
    borderColorClass = "border-success-500"; 
  }

  const baseInputStyle = "px-0 bg-transparent border-t-0 border-x-0 border-b rounded-none h-12";

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <FormControl isInvalid={isInvalid} size="md" className="mb-6">
      <FormControlLabel>
        <FormControlLabelText className="text-typography-700 uppercase font-semibold text-sm">
          {label}
        </FormControlLabelText>
      </FormControlLabel>

      <Input
        className={`${baseInputStyle} ${borderColorClass}`}
        size="lg"
      >
        <InputField
          className="px-0 leading-none text-typography-900"
          type={type === "password" && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {type === "password" && (
          <InputSlot className="pr-3" onPress={handleTogglePassword}>
            <InputIcon
              as={showPassword ? EyeIcon : EyeOffIcon}
              className="text-typography-500"
            />
          </InputSlot>
        )}
      </Input>

      {!isInvalid && helperText && (
        <FormControlHelper className="mt-2">
          <FormControlHelperText className="text-typography-500 text-xs">
            {helperText}
          </FormControlHelperText>
        </FormControlHelper>
      )}

      <FormControlError className="mt-2">
        <FormControlErrorIcon as={AlertCircleIcon} className="text-error-500" />
        <FormControlErrorText className="text-error-500 ml-2">
          {errorMessage}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
}