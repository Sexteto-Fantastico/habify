import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { FrequencyLabel } from "@/constants/frequency-labels";
import { HabitFrequency, Tag } from "@/lib/types";
import { useState, useEffect } from "react";
import { View } from "react-native";
import { Box } from "../ui/box";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Input, InputField } from "../ui/input";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import { Badge, BadgeText } from "../ui/badge";
import { Pressable } from "../ui/pressable";

export interface Filters {
  frequency?: HabitFrequency;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

interface StatsFiltersProps {
  initialFilters?: Filters;
  tags: Tag[];
  onApply: (filters: Filters) => void;
  onClear: () => void;
}

export function StatsFilters({
  initialFilters = {},
  tags,
  onApply,
  onClear,
}: StatsFiltersProps) {
  // Estado local completo dos filtros
  const [filters, setFilters] = useState<Filters>({
    frequency: initialFilters.frequency,
    startDate: initialFilters.startDate || "",
    endDate: initialFilters.endDate || "",
    tags: initialFilters.tags || [],
  });

  // Sincroniza quando os filtros iniciais mudam (quando o modal abre)
  useEffect(() => {
    setFilters({
      frequency: initialFilters.frequency,
      startDate: initialFilters.startDate || "",
      endDate: initialFilters.endDate || "",
      tags: initialFilters.tags || [],
    });
  }, [initialFilters]);

  const toggleTag = (tagName: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter((t) => t !== tagName)
      : [...currentTags, tagName];
    setFilters({
      ...filters,
      tags: newTags,
    });
  };

  // Valida se uma data está no formato YYYY-MM-DD
  const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return false;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;

    const [year, month, day] = dateStr.split("-").map(Number);

    // Verifica se os valores são válidos
    if (year < 1000 || year > 9999 || month < 1 || month > 12) {
      return false;
    }

    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  // Função para aplicar os filtros
  const handleApply = () => {
    const newFilters: Filters = {
      frequency: filters.frequency,
    };

    // Valida e aplica data inicial
    if (filters.startDate && filters.startDate.trim()) {
      if (isValidDate(filters.startDate)) {
        newFilters.startDate = filters.startDate;
      } else {
        // Se a data for inválida, limpa o filtro
        newFilters.startDate = undefined;
      }
    } else {
      newFilters.startDate = undefined;
    }

    // Valida e aplica data final
    if (filters.endDate && filters.endDate.trim()) {
      if (isValidDate(filters.endDate)) {
        newFilters.endDate = filters.endDate;
      } else {
        // Se a data for inválida, limpa o filtro
        newFilters.endDate = undefined;
      }
    } else {
      newFilters.endDate = undefined;
    }

    // Verifica se a data inicial é anterior à data final
    if (newFilters.startDate && newFilters.endDate) {
      const start = new Date(newFilters.startDate);
      const end = new Date(newFilters.endDate);

      if (start > end) {
        // Se data inicial for maior que final, inverte
        [newFilters.startDate, newFilters.endDate] = [
          newFilters.endDate,
          newFilters.startDate,
        ];
        setFilters({
          ...filters,
          startDate: newFilters.startDate,
          endDate: newFilters.endDate,
        });
      }
    }

    // Aplica tags se houver alguma selecionada
    if (filters.tags && filters.tags.length > 0) {
      newFilters.tags = filters.tags;
    } else {
      newFilters.tags = undefined;
    }

    // Chama a função de aplicar com os novos filtros
    onApply(newFilters);
  };

  // Função para limpar todos os filtros
  const handleClear = () => {
    const clearedFilters: Filters = {
      frequency: undefined,
      startDate: undefined,
      endDate: undefined,
      tags: undefined,
    };
    setFilters({
      frequency: undefined,
      startDate: "",
      endDate: "",
      tags: [],
    });
    onApply(clearedFilters);
    onClear();
  };

  // Função para formatar data para exibição
  const formatDateForDisplay = (dateStr?: string): string => {
    if (!dateStr || !isValidDate(dateStr)) return "";

    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <Box>
      <VStack space="lg">
        <VStack space="sm">
          <Text size="md" className="font-semibold text-typography-900">
            Frequência
          </Text>
          <HStack space="sm">
            <Button
              size="sm"
              variant={filters.frequency === undefined ? "solid" : "outline"}
              onPress={() => setFilters({ ...filters, frequency: undefined })}
              className="flex-1"
            >
              <ButtonText>Todas</ButtonText>
            </Button>
            {(["daily", "weekly", "monthly"] as HabitFrequency[]).map(
              (freq) => (
                <Button
                  size="sm"
                  key={freq}
                  variant={filters.frequency === freq ? "solid" : "outline"}
                  onPress={() => setFilters({ ...filters, frequency: freq })}
                  className="flex-1"
                >
                  <ButtonText>{FrequencyLabel[freq]}</ButtonText>
                </Button>
              ),
            )}
          </HStack>
        </VStack>

        <VStack space="sm">
          <Text size="md" className="font-semibold text-typography-900">
            Período
          </Text>

          <VStack space="md">
            <FormControl
              isInvalid={
                filters.startDate ? !isValidDate(filters.startDate) : false
              }
            >
              <FormControlLabel>
                <FormControlLabelText size="sm" className="text-typography-600">
                  Data Inicial{" "}
                  {filters.startDate &&
                    isValidDate(filters.startDate) &&
                    `(${formatDateForDisplay(filters.startDate)})`}
                </FormControlLabelText>
              </FormControlLabel>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="YYYY-MM-DD"
                  value={filters.startDate}
                  onChangeText={(text) =>
                    setFilters({ ...filters, startDate: text })
                  }
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </Input>
              {filters.startDate && !isValidDate(filters.startDate) && (
                <FormControlError>
                  <FormControlErrorText size="sm">
                    Data inválida. Use o formato YYYY-MM-DD
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl
              isInvalid={
                filters.endDate ? !isValidDate(filters.endDate) : false
              }
            >
              <FormControlLabel>
                <FormControlLabelText size="sm" className="text-typography-600">
                  Data Final{" "}
                  {filters.endDate &&
                    isValidDate(filters.endDate) &&
                    `(${formatDateForDisplay(filters.endDate)})`}
                </FormControlLabelText>
              </FormControlLabel>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="YYYY-MM-DD"
                  value={filters.endDate}
                  onChangeText={(text) =>
                    setFilters({ ...filters, endDate: text })
                  }
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </Input>
              {filters.endDate && !isValidDate(filters.endDate) && (
                <FormControlError>
                  <FormControlErrorText size="sm">
                    Data inválida. Use o formato YYYY-MM-DD
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
          </VStack>

          <HStack space="sm" className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                const today = new Date();
                const firstDay = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  1,
                );
                const lastDay = new Date(
                  today.getFullYear(),
                  today.getMonth() + 1,
                  0,
                );

                const formatToYYYYMMDD = (date: Date) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  return `${year}-${month}-${day}`;
                };

                const startDateStr = formatToYYYYMMDD(firstDay);
                const endDateStr = formatToYYYYMMDD(lastDay);

                setFilters({
                  ...filters,
                  startDate: startDateStr,
                  endDate: endDateStr,
                });
              }}
              className="flex-1"
            >
              <ButtonText size="sm">Mês atual</ButtonText>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                const today = new Date();
                const firstDayLastMonth = new Date(
                  today.getFullYear(),
                  today.getMonth() - 1,
                  1,
                );
                const lastDayLastMonth = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  0,
                );

                const formatToYYYYMMDD = (date: Date) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  return `${year}-${month}-${day}`;
                };

                const startDateStr = formatToYYYYMMDD(firstDayLastMonth);
                const endDateStr = formatToYYYYMMDD(lastDayLastMonth);

                setFilters({
                  ...filters,
                  startDate: startDateStr,
                  endDate: endDateStr,
                });
              }}
              className="flex-1"
            >
              <ButtonText size="sm">Último mês</ButtonText>
            </Button>
          </HStack>
        </VStack>

        <VStack space="sm">
          <Text size="md" className="font-semibold text-typography-900">
            Tags
          </Text>
          {tags.length === 0 ? (
            <Box className="rounded-md border border-dashed border-outline-300 p-4">
              <Text size="sm" className="text-center text-typography-500">
                Nenhuma tag disponível
              </Text>
            </Box>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = filters.tags?.includes(tag.name) || false;
                return (
                  <Pressable
                    key={tag.id}
                    onPress={() => toggleTag(tag.name)}
                    className={`rounded-full border-2 px-3 py-1.5 ${
                      isSelected
                        ? "border-primary-500 bg-primary-50"
                        : "border-outline-300 bg-background-0"
                    }`}
                  >
                    <HStack space="xs" className="items-center">
                      <Box
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <Text size="sm" className="text-typography-900">
                        {tag.name}
                      </Text>
                    </HStack>
                  </Pressable>
                );
              })}
            </View>
          )}
        </VStack>

        <HStack space="sm" className="pt-2">
          <Button
            variant="outline"
            action="secondary"
            onPress={handleClear}
            className="flex-1"
          >
            <ButtonText>Limpar</ButtonText>
          </Button>
          <Button onPress={handleApply} className="flex-1">
            <ButtonText>Aplicar</ButtonText>
          </Button>
        </HStack>

        {/* Status dos filtros ativos */}
        {(filters.frequency ||
          filters.startDate ||
          filters.endDate ||
          (filters.tags && filters.tags.length > 0)) && (
          <VStack space="sm" className="mt-4 border-t border-outline-200 pt-4">
            <Text size="sm" className="font-semibold text-typography-900">
              Filtros Ativos:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {filters.frequency && (
                <Badge action="info" variant="solid" size="sm">
                  <BadgeText size="sm">
                    Frequência: {FrequencyLabel[filters.frequency]}
                  </BadgeText>
                </Badge>
              )}
              {filters.startDate && isValidDate(filters.startDate) && (
                <Badge action="info" variant="solid" size="sm">
                  <BadgeText size="sm">
                    De: {formatDateForDisplay(filters.startDate)}
                  </BadgeText>
                </Badge>
              )}
              {filters.endDate && isValidDate(filters.endDate) && (
                <Badge action="info" variant="solid" size="sm">
                  <BadgeText size="sm">
                    Até: {formatDateForDisplay(filters.endDate)}
                  </BadgeText>
                </Badge>
              )}
              {filters.tags &&
                filters.tags.map((tagName) => {
                  const tag = tags.find((t) => t.name === tagName);
                  return tag ? (
                    <Badge
                      key={tag.id}
                      action="muted"
                      variant="solid"
                      size="sm"
                      style={{ backgroundColor: `${tag.color}20` }}
                    >
                      <BadgeText size="sm" style={{ color: tag.color }}>
                        {tag.name}
                      </BadgeText>
                    </Badge>
                  ) : null;
                })}
            </View>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
