<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TarefaController;

Route::middleware(['api', 'cors'])->group(function (){
    Route::apiResource('tarefas', TarefaController::class)->only([
    'index', 'store', 'destroy'
]);
});
