import { NextResponse } from 'next/server'

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status })
export const err = (message: string, status: number) => NextResponse.json({ error: message }, { status })
export const notFound = (msg = 'Not found.') => err(msg, 404)
export const badRequest = (msg = 'Missing fields') => err(msg, 400)
export const serverError = (msg: string) => err(msg, 500)
