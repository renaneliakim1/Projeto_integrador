import * as React from "react";
import { ChevronUp, ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AnimatedDatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
}

const AnimatedNumber: React.FC<{
  value: number;
  setValue: (value: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  label: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}> = ({
  value,
  setValue,
  onIncrement,
  onDecrement,
  label,
  min,
  max,
  disabled,
}) => {
  const [inputValue, setInputValue] = React.useState(value.toString().padStart(2, "0"));

  React.useEffect(() => {
    setInputValue(value.toString().padStart(2, "0"));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    let numValue = parseInt(inputValue, 10);
    if (isNaN(numValue)) {
      numValue = min ?? 1;
    }
    if (max !== undefined) numValue = Math.min(numValue, max);
    if (min !== undefined) numValue = Math.max(numValue, min);
    setValue(numValue);
    setInputValue(numValue.toString().padStart(2, "0"));
  };

  return (
    <div className="flex flex-col items-center space-y-2 group">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 disabled:opacity-30"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>

      <div className="relative">
        <div className="text-xs text-muted-foreground font-medium mb-1 text-center">
          {label}
        </div>
        <div className="relative h-12 w-16 bg-gradient-subtle border border-primary/20 rounded-lg flex items-center justify-center overflow-hidden shadow-elegant group-hover:shadow-glow transition-all duration-300">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="text-2xl font-bold text-primary bg-transparent border-none text-center w-full h-full focus:ring-0 focus-visible:ring-offset-0 focus-visible:ring-0"
            disabled={disabled}
            maxLength={2}
          />
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDecrement}
        disabled={disabled || (min !== undefined && value <= min)}
        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 disabled:opacity-30"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function AnimatedDatePicker({
  date,
  onSelect,
  className,
  disabled = false,
  minYear = 1900,
  maxYear = new Date().getFullYear(),
}: AnimatedDatePickerProps) {
  const today = new Date();
  const initialDate = date && date <= today ? date : today;

  const [day, setDay] = React.useState(initialDate.getDate());
  const [month, setMonth] = React.useState(initialDate.getMonth() + 1);
  const [year, setYear] = React.useState(initialDate.getFullYear());
  const [yearInputValue, setYearInputValue] = React.useState(year.toString());

  React.useEffect(() => {
    if (date) {
      const newDate = date > today ? today : date;
      setDay(newDate.getDate());
      setMonth(newDate.getMonth() + 1);
      setYear(newDate.getFullYear());
    }
  }, [date]);

  React.useEffect(() => {
    setYearInputValue(year.toString());
  }, [year]);

  React.useEffect(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const validDay = Math.min(day, daysInMonth);
    
    let newDate = new Date(year, month - 1, validDay);

    if (newDate > today) {
        newDate = today;
        setYear(today.getFullYear());
        setMonth(today.getMonth() + 1);
        setDay(today.getDate());
    }
    
    if (onSelect && !disabled) {
      onSelect(newDate);
    }
  }, [day, month, year, onSelect, disabled]);

  const getDaysInMonth = () => {
    return new Date(year, month, 0).getDate();
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYearInputValue(e.target.value);
  };

  const handleYearBlur = () => {
    let numValue = parseInt(yearInputValue, 10);
    if (isNaN(numValue)) {
      numValue = minYear;
    }
    if (numValue < minYear) numValue = minYear;
    if (numValue > maxYear) numValue = maxYear;
    setYear(numValue);
    setYearInputValue(numValue.toString());
  }

  return (
    <Card
      className={cn(
        "w-fit mx-auto border-primary/20 shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-subtle",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-primary">
            Selecionar Data
          </h3>
        </div>

        <div className="flex items-center justify-center gap-4">
          <AnimatedNumber
            value={day}
            setValue={setDay}
            onIncrement={() => setDay((prev) => Math.min(prev + 1, getDaysInMonth()))}
            onDecrement={() => setDay((prev) => Math.max(prev - 1, 1))}
            label="Dia"
            min={1}
            max={getDaysInMonth()}
            disabled={disabled}
          />

          <div className="text-2xl font-light text-primary/60 self-end pb-6">
            /
          </div>

          <AnimatedNumber
            value={month}
            setValue={setMonth}
            onIncrement={() => setMonth((prev) => (prev === 12 ? 1 : prev + 1))}
            onDecrement={() => setMonth((prev) => (prev === 1 ? 12 : prev - 1))}
            label="Mês"
            min={1}
            max={12}
            disabled={disabled}
          />

          <div className="text-2xl font-light text-primary/60 self-end pb-6">
            /
          </div>

          <div className="flex flex-col items-center space-y-2 group">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setYear((prev) => Math.min(prev + 1, maxYear))}
              disabled={disabled || year >= maxYear}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>

            <div className="relative">
              <div className="text-xs text-muted-foreground font-medium mb-1 text-center">
                Ano
              </div>
              <div className="relative h-12 w-20 bg-gradient-subtle border border-primary/20 rounded-lg flex items-center justify-center overflow-hidden shadow-elegant group-hover:shadow-glow transition-all duration-300">
                <Input
                  type="text"
                  value={yearInputValue}
                  onChange={handleYearChange}
                  onBlur={handleYearBlur}
                  className="text-xl font-bold text-primary bg-transparent border-none text-center w-full h-full focus:ring-0 focus-visible:ring-offset-0 focus-visible:ring-0"
                  disabled={disabled}
                  maxLength={4}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setYear((prev) => Math.max(prev - 1, minYear))}
              disabled={disabled || year <= minYear}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="text-sm text-muted-foreground">Data selecionada:</div>
          <div className="text-lg font-semibold text-primary animate-bounce-in">
            {day.toString().padStart(2, "0")}/
            {month.toString().padStart(2, "0")}/{year}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}