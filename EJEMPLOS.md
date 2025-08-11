# Datos de Ejemplo para Pruebas

Para probar la aplicación rápidamente, puedes usar estos datos de ejemplo:

## Viaje de Ejemplo: "Viaje a Cartagena"

### Participantes:
- Pedro
- Ana
- Carlos

### Gastos de Ejemplo:

1. **Hotel**
   - Monto: $700,000
   - Pagado por: Pedro
   - Participantes: Pedro, Ana, Carlos

2. **Cena del primer día**
   - Monto: $150,000
   - Pagado por: Ana
   - Participantes: Pedro, Ana, Carlos

3. **Gasolina**
   - Monto: $80,000
   - Pagado por: Carlos
   - Participantes: Pedro, Carlos

4. **Desayuno**
   - Monto: $45,000
   - Pagado por: Pedro
   - Participantes: Pedro, Ana

## Resultado Esperado:

### Balances:
- **Pedro**: Pagó $745,000, debe $455,000 → Balance: +$290,000 (le deben)
- **Ana**: Pagó $150,000, debe $315,000 → Balance: -$165,000 (debe)
- **Carlos**: Pagó $80,000, debe $205,000 → Balance: -$125,000 (debe)

### Matriz de Deudas:
| Pagador/Deudor | Pedro | Ana      | Carlos   |
|----------------|-------|----------|----------|
| Pedro          | -     | $233,333 | $233,333 |
| Ana            | $50,000| -       | $50,000  |
| Carlos         | $40,000| -       | -        |

## Cómo usar estos datos:

1. Abre la aplicación
2. Crea un nuevo viaje llamado "Viaje a Cartagena"
3. Agrega los participantes: Pedro, Ana, Carlos
4. Registra cada gasto según la información anterior
5. Ve a la pestaña "Balances" para ver los resultados

Los cálculos deberían coincidir aproximadamente con los valores esperados.
