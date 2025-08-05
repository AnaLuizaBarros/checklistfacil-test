<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        $allowedOrigins = config('cors.allowed_origins');
        $origin = $request->headers->get('Origin');

        if ($origin && in_array($origin, $allowedOrigins)) {

            if ($request->isMethod('OPTIONS')) {
                $response = response('', 200);
                $response->header('Access-Control-Allow-Origin', $origin);
                $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
                $response->header('Vary', 'Origin');

                return $response;
            }
            $response = $next($request);

            $response->header('Access-Control-Allow-Origin', $origin);
            $response->header('Vary', 'Origin');

            return $response;
        }
        return $next($request);
    }
}
