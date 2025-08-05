<?php

namespace App\Services;
use RuntimeException;

class TarefaService
{
    private string $caminhoArquivo;

    public function __construct()
    {
        $this->caminhoArquivo = storage_path('app/tarefas.json');
    }

    public function obterTodas(): array
    {
        if (!file_exists($this->caminhoArquivo)) {
            $this->salvarTodas($this->obterDadosIniciais());
        }

        $ponteiro = fopen($this->caminhoArquivo, 'r');

        if ($ponteiro === false) {
            throw new RuntimeException("Não foi possível abrir o arquivo de tarefas para leitura.");
        }

        try {
            if (!flock($ponteiro, LOCK_SH)) {
                throw new RuntimeException("Não foi possível obter o lock de leitura no arquivo.");
            }

            $tamanho = filesize($this->caminhoArquivo);
            if ($tamanho === 0) {
                return [];
            }

            $conteudo = fread($ponteiro, $tamanho);
            if ($conteudo === false) {
                 throw new RuntimeException("Falha ao ler o conteúdo do arquivo de tarefas.");
            }

            return json_decode($conteudo, true, 512, JSON_THROW_ON_ERROR);

        } finally {
            flock($ponteiro, LOCK_UN);
            fclose($ponteiro);
        }
    }


    public function salvarTodas(array $tarefas): void
    {
        $conteudoJson = json_encode($tarefas, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);

        if (file_put_contents($this->caminhoArquivo, $conteudoJson, LOCK_EX) === false) {
            throw new RuntimeException("Não foi possível escrever no arquivo de tarefas.");
        }
    }

    private function obterDadosIniciais(): array
    {
        return [
            ['id' => 1, 'title' => 'Tarefa 1', 'completed' => false],
            ['id' => 2, 'title' => 'Tarefa 2', 'completed' => true],
            ['id' => 3, 'title' => 'Tarefa 3', 'completed' => false],
        ];
    }
}
