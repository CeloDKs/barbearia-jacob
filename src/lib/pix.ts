function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function sanitize(s: string, max: number): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max)
    .trim();
}

/**
 * Gera o "PIX Copia e Cola" (BR Code estático) padrão BACEN/EMV
 * a partir da chave PIX do recebedor. Não exige adquirente/gateway.
 */
export function gerarPixCopiaECola(params: {
  chave: string;
  nomeRecebedor: string;
  cidade: string;
  valorCentavos?: number;
  txid?: string;
}): string {
  const chave = (params.chave ?? "").trim();
  if (!chave) return "";
  const nome = sanitize(params.nomeRecebedor || "RECEBEDOR", 25) || "RECEBEDOR";
  const cidade = sanitize(params.cidade || "CIDADE", 15) || "CIDADE";
  const txid = sanitize(params.txid || "***", 25) || "***";

  const mai = tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", chave));

  let payload = tlv("00", "01") + mai + tlv("52", "0000") + tlv("53", "986");
  if (params.valorCentavos && params.valorCentavos > 0) {
    payload += tlv("54", (params.valorCentavos / 100).toFixed(2));
  }
  payload += tlv("58", "BR") + tlv("59", nome) + tlv("60", cidade) + tlv("62", tlv("05", txid));
  payload += "6304";
  return payload + crc16(payload);
}
