export function createSlug(text: string): string {
  return text
    .normalize('NFD') // Normaliza o texto para decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove marcas diacríticas (acentos)
    .replace(/[^\w\s]/gi, '') // Remove caracteres especiais, mantendo letras e números
    .trim() // Remove espaços em branco no início e no final
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .toLowerCase() // Converte o texto para minúsculas
}
