// src/middleware.ts
import type { NextRequest } from 'next/server';
import type { NextResponse } from 'next/server';

// This is a minimal middleware function that does nothing.
// Next.js requires this file to export a function named `middleware` or a default function
// if the file itself exists.
export function middleware(request: NextRequest): NextResponse | void {
  // You can add logic here if needed in the future.
  // For now, it's a no-op.
  // Returning nothing or NextResponse.next() allows the request to continue.
}

// Optional: The config object specifies which paths the middleware should run on.
// An empty matcher array means it effectively won't run on any specific paths,
// beyond Next.js's default behavior for an existing middleware file.
// Or, to be more explicit that it shouldn't actively match anything:
export const config = {
  matcher: [
    // Example: '/((?!api|_next/static|_next/image|favicon.ico).*)'
    // For a true no-op effect without deleting the file,
    // we can leave the matcher empty or ensure it doesn't match user routes.
    // To avoid it running on any paths, we can use a regex that won't match.
    // However, an empty array should also prevent it from running on any paths.
  ],
};
