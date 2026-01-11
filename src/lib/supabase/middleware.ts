import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public routes that don't need Supabase session handling
const publicRoutes = ['/', '/auth', '/validate']

export async function updateSession(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Early exit if env vars are missing - prevents crashes
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase environment variables not configured')
        return NextResponse.next({ request })
    }

    // Skip Supabase handling for public routes - just pass through
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith('/auth/')
    )

    if (isPublicRoute) {
        return NextResponse.next({ request })
    }

    // For protected routes, handle Supabase session
    let supabaseResponse = NextResponse.next({
        request,
    })

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Protect routes that require authentication
        const protectedRoutes = ['/dashboard', '/validate', '/results']
        const isProtectedRoute = protectedRoutes.some(route =>
            pathname.startsWith(route)
        )

        if (isProtectedRoute && !user) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth'
            return NextResponse.redirect(url)
        }

        return supabaseResponse
    } catch (error) {
        // If Supabase fails, redirect to auth for protected routes
        console.error('Middleware Supabase error:', error)
        const protectedRoutes = ['/dashboard', '/validate', '/results']
        const isProtectedRoute = protectedRoutes.some(route =>
            pathname.startsWith(route)
        )

        if (isProtectedRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth'
            return NextResponse.redirect(url)
        }

        return NextResponse.next({ request })
    }
}
