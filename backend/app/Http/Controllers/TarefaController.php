<?php

namespace App\Http\Controllers;

use App\Services\TarefaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class TarefaController extends Controller
{
    /**
     * @var TarefaService
     */
    private $tarefaService;

    /**
     *
     * @param TarefaService $tarefaService
     */
    public function __construct(TarefaService $tarefaService)
    {
        $this->tarefaService = $tarefaService;
    }

    /**
     * MÉTODO INDEX (GET /tarefas)
     * Lista todas as tarefas.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $tarefas = $this->tarefaService->obterTodas();
            return response()->json($tarefas);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao carregar a lista de tarefas.'], 500);
        }
    }

    /**
     * MÉTODO STORE (POST /tarefas)
     * Cria uma nova tarefa.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $dadosValidados = $request->validate([
                'title' => 'required|string|max:255',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Dados inválidos.', 'errors' => $e->errors()], 422);
        }

        try {
            $tarefas = $this->tarefaService->obterTodas();

            $novaTarefa = [
                'id' => count($tarefas) > 0 ? max(array_column($tarefas, 'id')) + 1 : 1,
                'title' => $dadosValidados['title'],
                'completed' => false,
            ];

            $tarefas[] = $novaTarefa;
            $this->tarefaService->salvarTodas($tarefas);

            return response()->json($novaTarefa, 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Ocorreu um erro ao salvar a nova tarefa.'], 500);
        }
    }

    /**
     * MÉTODO DESTROY (DELETE /tarefas/{id})
     * Deleta uma tarefa específica.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $tarefas = $this->tarefaService->obterTodas();

            $index = array_search($id, array_column($tarefas, 'id'));

            if ($index === false) {
                return response()->json(['message' => 'Tarefa não encontrada.'], 404); // 404 Not Found
            }

            array_splice($tarefas, $index, 1);
            $this->tarefaService->salvarTodas($tarefas);

            return response()->json(null, 204);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Ocorreu um erro ao deletar a tarefa.'], 500);
        }
    }
}
