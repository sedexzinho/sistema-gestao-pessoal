package org.example.service;

import de.focus_shift.jollyday.core.HolidayCalendar;
import de.focus_shift.jollyday.core.HolidayManager;
import de.focus_shift.jollyday.core.ManagerParameters;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;

@Service
public class DiasUteisService {

    private final HolidayManager holidayManager;

    public DiasUteisService() {
        this.holidayManager = HolidayManager.getInstance(
                ManagerParameters.create(HolidayCalendar.BRAZIL)
        );
    }

    public boolean isDiaUtil(LocalDate data) {
        // Pela CLT: domingo NÃO conta, sábado CONTA
        if (data.getDayOfWeek() == DayOfWeek.SUNDAY) return false;
        // Feriados nacionais NÃO contam
        if (holidayManager.isHoliday(data)) return false;
        return true;
    }

    public LocalDate encontrarQuintoDiaUtil(int ano, int mes) {
        LocalDate dia = LocalDate.of(ano, mes, 1);
        YearMonth yearMonth = YearMonth.of(ano, mes);
        int diasUteis = 0;

        while (dia.getMonthValue() == mes) {
            if (isDiaUtil(dia)) {
                diasUteis++;
                if (diasUteis == 5) return dia;
            }
            dia = dia.plusDays(1);
        }

        // Segurança: se o mês tiver menos de 5 dias úteis, retorna o último dia útil
        return dia.minusDays(1);
    }
}