export interface Bloco {
  id: string; // Ex: "level-1-focus-1"
  tipo: 'foco' | 'bncc'; // To differentiate the questions
  titulo: string; // Ex: "Focus 1" or "BNCC Review 1"
}

export interface NivelTrilha {
  nivel: number; // The level number (1 to 30)
  titulo: string; // Ex: "Level 1: First Steps"
  blocos: Bloco[]; // The list of 15 blocks
}

export function gerarTrilhaPrincipal(): NivelTrilha[] {
  const trilha: NivelTrilha[] = [];

  for (let i = 1; i <= 30; i++) {
    const nivelAtual: NivelTrilha = {
      nivel: i,
      titulo: `Level ${i}`,
      blocos: [],
    };

    let contadorFoco = 1;
    let contadorBncc = 1;

    for (let j = 1; j <= 15; j++) {
      if (j % 3 === 0) {
        nivelAtual.blocos.push({
          id: `nivel-${i}-bncc-${contadorBncc}`,
          tipo: 'bncc',
          titulo: `BNCC Review ${contadorBncc}`,
        });
        contadorBncc++;
      } else {
        nivelAtual.blocos.push({
          id: `nivel-${i}-foco-${contadorFoco}`,
          tipo: 'foco',
          titulo: `Focus ${contadorFoco}`,
        });
        contadorFoco++;
      }
    }
    trilha.push(nivelAtual);
  }
  return trilha;
}

export const trilhaPrincipal = gerarTrilhaPrincipal();
