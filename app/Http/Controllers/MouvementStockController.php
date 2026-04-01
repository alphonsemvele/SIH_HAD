<?php

namespace App\Http\Controllers;

use App\Http\Requests\MouvementStockStoreRequest;
use App\Http\Requests\MouvementStockUpdateRequest;
use App\Http\Resources\MouvementStockResource;
use App\Models\MouvementStock;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MouvementStockController extends Controller
{
    public function index(Request $request): Response
    {
        $mouvementStocks = MouvementStock::all();
    }

    public function store(MouvementStockStoreRequest $request)
    {
        $mouvementStock = MouvementStock::create($request->validated());

        return $mouvement_stock;
    }

    public function show(Request $request, MouvementStock $mouvementStock): MouvementStockResource
    {
        return new MouvementStockResource($mouvementStock);
    }

    public function update(MouvementStockUpdateRequest $request, MouvementStock $mouvementStock): MouvementStockResource
    {
        $mouvementStock->update($request->validated());

        return new MouvementStockResource($mouvementStock);
    }

    public function destroy(Request $request, MouvementStock $mouvementStock): Response
    {
        $mouvementStock->delete();

        return response()->noContent();
    }
}
