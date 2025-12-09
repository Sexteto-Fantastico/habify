import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { FrequencyLabel } from "@/constants/frequency-labels";
import { HabitFrequency, Tag } from "@/lib/types";
import { View, Pressable, TextInput } from "react-native";
import { useState, useEffect } from "react";

interface StatsFiltersProps {
  filters: {
    frequency?: HabitFrequency;
    startDate?: string;
    endDate?: string;
    tags?: string[];
  };
  onFiltersChange: (filters: {
    frequency?: HabitFrequency;
    startDate?: string;
    endDate?: string;
    tags?: string[];
  }) => void;
  tags: Tag[];
  onApply: () => void;
  onClear: () => void;
}

export function StatsFilters({
  filters,
  onFiltersChange,
  tags,
  onApply,
  onClear,
}: StatsFiltersProps) {
  const [localStartDate, setLocalStartDate] = useState(filters.startDate || "");
  const [localEndDate, setLocalEndDate] = useState(filters.endDate || "");

  // Sincroniza os estados locais quando os filtros mudam externamente
  useEffect(() => {
    setLocalStartDate(filters.startDate || "");
    setLocalEndDate(filters.endDate || "");
  }, [filters.startDate, filters.endDate]);

  const toggleTag = (tagName: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter((t) => t !== tagName)
      : [...currentTags, tagName];
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  // Valida se uma data está no formato YYYY-MM-DD
  const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;
    
    const [year, month, day] = dateStr.split('-').map(Number);
    
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
    const newFilters = { ...filters };

    // Valida e aplica data inicial
    if (localStartDate.trim()) {
      if (isValidDate(localStartDate)) {
        newFilters.startDate = localStartDate;
      } else {
        // Se a data for inválida, limpa o filtro
        newFilters.startDate = undefined;
      }
    } else {
      newFilters.startDate = undefined;
    }

    // Valida e aplica data final
    if (localEndDate.trim()) {
      if (isValidDate(localEndDate)) {
        newFilters.endDate = localEndDate;
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
        [newFilters.startDate, newFilters.endDate] = [newFilters.endDate, newFilters.startDate];
        setLocalStartDate(newFilters.startDate);
        setLocalEndDate(newFilters.endDate);
      }
    }

    // Atualiza os filtros
    onFiltersChange(newFilters);
    
    // Chama a função de aplicar
    onApply();
  };

  // Função para limpar todos os filtros
  const handleClear = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    onFiltersChange({
      frequency: undefined,
      startDate: undefined,
      endDate: undefined,
      tags: undefined,
    });
    onClear();
  };

  // Função para formatar data para exibição
  const formatDateForDisplay = (dateStr?: string): string => {
    if (!dateStr || !isValidDate(dateStr)) return "";
    
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <Card>
      <View className="gap-4">
        <View className="gap-2">
          <Text className="font-medium">Frequência</Text>
          <View className="flex-row gap-2">
            <Button
              variant={filters.frequency === undefined ? "solid" : "outline"}
              onPress={() =>
                onFiltersChange({ ...filters, frequency: undefined })
              }
              className="flex-1"
            >
              <Text>Todas</Text>
            </Button>
            {(["daily", "weekly", "monthly"] as HabitFrequency[]).map(
              (freq) => (
                <Button
                  key={freq}
                  variant={filters.frequency === freq ? "solid" : "outline"}
                  onPress={() =>
                    onFiltersChange({ ...filters, frequency: freq })
                  }
                  className="flex-1"
                >
                  <Text>{FrequencyLabel[freq]}</Text>
                </Button>
              ),
            )}
          </View>
        </View>

        <View className="gap-2">
          <Text className="font-medium">Período</Text>
          
          <View className="gap-3">
            <View>
              <Text size="sm" className="mb-1 text-muted-foreground">
                Data Inicial {filters.startDate && isValidDate(filters.startDate) && 
                  `(${formatDateForDisplay(filters.startDate)})`}
              </Text>
              <View className="rounded-lg border border-input bg-background px-3 py-2">
                <TextInput
                  className="text-foreground"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#71717a"
                  value={localStartDate}
                  onChangeText={setLocalStartDate}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </View>
              {localStartDate && !isValidDate(localStartDate) && (
                <Text size="sm" className="mt-1 text-destructive">
                  Data inválida. Use o formato YYYY-MM-DD
                </Text>
              )}
            </View>

            <View>
              <Text size="sm" className="mb-1 text-muted-foreground">
                Data Final {filters.endDate && isValidDate(filters.endDate) && 
                  `(${formatDateForDisplay(filters.endDate)})`}
              </Text>
              <View className="rounded-lg border border-input bg-background px-3 py-2">
                <TextInput
                  className="text-foreground"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#71717a"
                  value={localEndDate}
                  onChangeText={setLocalEndDate}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </View>
              {localEndDate && !isValidDate(localEndDate) && (
                <Text size="sm" className="mt-1 text-destructive">
                  Data inválida. Use o formato YYYY-MM-DD
                </Text>
              )}
            </View>
          </View>

          {/* Botão para usar o mês atual */}
          <View className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                
                const formatToYYYYMMDD = (date: Date) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                };
                
                const startDateStr = formatToYYYYMMDD(firstDay);
                const endDateStr = formatToYYYYMMDD(lastDay);
                
                setLocalStartDate(startDateStr);
                setLocalEndDate(endDateStr);
                
                onFiltersChange({
                  ...filters,
                  startDate: startDateStr,
                  endDate: endDateStr,
                });
              }}
            >
              <Text size="sm">Usar mês atual</Text>
            </Button>
            
            {/* Botão para usar último mês */}
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                const today = new Date();
                const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                
                const formatToYYYYMMDD = (date: Date) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                };
                
                const startDateStr = formatToYYYYMMDD(firstDayLastMonth);
                const endDateStr = formatToYYYYMMDD(lastDayLastMonth);
                
                setLocalStartDate(startDateStr);
                setLocalEndDate(endDateStr);
                
                onFiltersChange({
                  ...filters,
                  startDate: startDateStr,
                  endDate: endDateStr,
                });
              }}
              className="mt-2"
            >
              <Text size="sm">Usar último mês</Text>
            </Button>
          </View>
        </View>

        <View className="gap-2">
          <Text className="font-medium">Tags</Text>
          {tags.length === 0 ? (
            <View className="rounded-md border border-dashed border-border p-4">
              <Text className="text-center text-muted-foreground">
                Nenhuma tag disponível
              </Text>
            </View>
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
                        ? "border-foreground bg-muted"
                        : "border-border bg-background"
                    }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <View
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <Text size="sm">{tag.name}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View className="flex-row gap-2 pt-2">
          <Button variant="outline" onPress={handleClear} className="flex-1">
            <Text>Limpar Filtros</Text>
          </Button>
          <Button onPress={handleApply} className="flex-1">
            <Text>Aplicar</Text>
          </Button>
        </View>

        {/* Status dos filtros ativos */}
        {(filters.frequency || filters.startDate || filters.endDate || (filters.tags && filters.tags.length > 0)) && (
          <View className="mt-4 border-t border-border pt-4">
            <Text size="sm" className="font-medium mb-2">
              Filtros Ativos:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {filters.frequency && (
                <View className="rounded-full bg-primary/10 px-3 py-1">
                  <Text size="sm" className="text-primary">
                    Frequência: {FrequencyLabel[filters.frequency]}
                  </Text>
                </View>
              )}
              {filters.startDate && isValidDate(filters.startDate) && (
                <View className="rounded-full bg-primary/10 px-3 py-1">
                  <Text size="sm" className="text-primary">
                    De: {formatDateForDisplay(filters.startDate)}
                  </Text>
                </View>
              )}
              {filters.endDate && isValidDate(filters.endDate) && (
                <View className="rounded-full bg-primary/10 px-3 py-1">
                  <Text size="sm" className="text-primary">
                    Até: {formatDateForDisplay(filters.endDate)}
                  </Text>
                </View>
              )}
              {filters.tags && filters.tags.map(tagName => {
                const tag = tags.find(t => t.name === tagName);
                return tag ? (
                  <View 
                    key={tag.id} 
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: `${tag.color}20` }}
                  >
                    <Text size="sm" style={{ color: tag.color }}>
                      {tag.name}
                    </Text>
                  </View>
                ) : null;
              })}
            </View>
          </View>
        )}
      </View>
    </Card>
  );
}