import React from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { StatsFilters, Filters } from "./StatsFilters";
import { Tag } from "@/lib/types";
import { Heading } from "@/components/ui/heading";
import { View } from "react-native";

interface FiltersActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: Filters;
  tags: Tag[];
  onApply: (filters: Filters) => void;
  onClear: () => void;
  title?: string;
}

export function FiltersActionSheet({
  initialFilters,
  isOpen,
  onClose,
  tags,
  onApply,
  onClear,
  title = "Filtrar",
}: FiltersActionSheetProps) {
  const handleApply = (filters: Filters) => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop onPress={onClose} />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View className="w-full pb-6">
          <Heading size="xl" className="my-4">
            {title}
          </Heading>

          <ActionsheetScrollView className="w-full">
            <StatsFilters
              initialFilters={initialFilters}
              tags={tags}
              onApply={handleApply}
              onClear={handleClear}
            />
          </ActionsheetScrollView>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
}
