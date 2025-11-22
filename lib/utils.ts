export const formatDate = (date: Date | string) => {
  if (typeof date === "string" && date.length >= 10) {
    const [year, month, day] = date.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  }
  // fallback para Date
  const formattedDate = new Date(date);
  return formattedDate.toLocaleDateString('pt-BR');
}