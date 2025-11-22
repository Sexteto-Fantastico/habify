export const formatDate = (date: Date | string) => {
  const formattedDate = new Date(date);
  return formattedDate.toLocaleDateString('pt-BR');
}