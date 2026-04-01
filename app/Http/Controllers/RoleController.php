<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleStoreRequest;
use App\Http\Requests\RoleUpdateRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::all();

        return $roles;
    }

    public function store(RoleStoreRequest $request)
    {
        $role = Role::create($request->validated());

        return $role;
    }

    public function show(Request $request, Role $role): RoleResource
    {
        return new RoleResource($role);
    }

    public function update(RoleUpdateRequest $request, Role $role): RoleResource
    {
        $role->update($request->validated());

        return new RoleResource($role);
    }

    public function destroy(Request $request, Role $role): Response
    {
        $role->delete();

        return response()->noContent();
    }
}
