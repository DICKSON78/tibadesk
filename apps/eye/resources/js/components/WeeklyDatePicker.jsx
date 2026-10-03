import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
} from "@mui/material";
import {
  ChevronLeftRounded as ChevronLeftIcon,
  ChevronRightRounded as ChevronRightIcon,
  CalendarTodayRounded as CalendarIcon,
} from "@mui/icons-material";
import DatePicker from "./DatePicker";

const WeeklyDatePicker = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  label = "Select Week",
  fullWidth = false,
  sx = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getWeekStartDate = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekEndDate = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7);
    return new Date(d.setDate(diff));
  };

  const navigateWeek = (direction) => {
    const currentDate = startDate || new Date();
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    
    const newStartDate = getWeekStartDate(newDate);
    const newEndDate = getWeekEndDate(newDate);
    
    onStartDateChange(newStartDate);
    onEndDateChange(newEndDate);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatWeekRange = () => {
    if (!startDate || !endDate) return 'Select a week';
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto', ...sx }}>
      <Button
        variant="outlined"
        fullWidth={fullWidth}
        onClick={() => setIsOpen(!isOpen)}
        startIcon={<CalendarIcon />}
        sx={{ 
          justifyContent: 'space-between',
          textTransform: 'none',
          minHeight: '56px'
        }}
      >
        <Typography variant="body2" sx={{ textAlign: 'left' }}>
          {formatWeekRange()}
        </Typography>
      </Button>
      
      {isOpen && (
        <Card
          sx={{
            position: 'absolute',
            zIndex: 1000,
            mt: 1,
            minWidth: 320,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {label}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton 
                  size="small" 
                  onClick={() => navigateWeek('prev')}
                >
                  <ChevronLeftIcon />
                </IconButton>
                
                <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>
                  {formatWeekRange()}
                </Typography>
                
                <IconButton 
                  size="small" 
                  onClick={() => navigateWeek('next')}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DatePicker
                  fullWidth
                  label="Week Start"
                  value={startDate}
                  onChange={(value) => {
                    if (value) {
                      const weekStart = getWeekStartDate(value);
                      const weekEnd = getWeekEndDate(value);
                      onStartDateChange(weekStart);
                      onEndDateChange(weekEnd);
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  fullWidth
                  label="Week End"
                  value={endDate}
                  onChange={(value) => {
                    if (value) {
                      const weekStart = getWeekStartDate(value);
                      const weekEnd = getWeekEndDate(value);
                      onStartDateChange(weekStart);
                      onEndDateChange(weekEnd);
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const today = new Date();
                  const weekStart = getWeekStartDate(today);
                  const weekEnd = getWeekEndDate(today);
                  onStartDateChange(weekStart);
                  onEndDateChange(weekEnd);
                }}
                sx={{ flex: 1 }}
              >
                This Week
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const lastWeek = new Date();
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  const weekStart = getWeekStartDate(lastWeek);
                  const weekEnd = getWeekEndDate(lastWeek);
                  onStartDateChange(weekStart);
                  onEndDateChange(weekEnd);
                }}
                sx={{ flex: 1 }}
              >
                Last Week
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WeeklyDatePicker;
