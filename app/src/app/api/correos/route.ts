import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  fetchCorreosDeClassroom,
  MAX_CORREOS_POR_PAGINA,
} from "@/app/lib/correos-server";
import { getNombresCursos } from "@/app/lib/tareas-server";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.access_token || session.error) {
    return NextResponse.json({ error: "no_autenticado" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const curso = params.get("curso");
  const origenParam = params.get("origen");
  const origen =
    origenParam === "Classroom" || origenParam === "CVG" ? origenParam : null;
  const busqueda = params.get("busqueda");
  const soloNoLeidos = params.get("noLeidos") === "1";
  const pageToken = params.get("pageToken");

  try {
    const userId = session.user?.email ?? "anon";
    const cursos = await getNombresCursos(session.access_token, userId);
    const pagina = await fetchCorreosDeClassroom(session.access_token, {
      cursos,
      curso,
      origen,
      busqueda,
      soloNoLeidos,
      pageToken,
      maxResults: MAX_CORREOS_POR_PAGINA,
    });

    return NextResponse.json(pagina);
  } catch (error) {
    console.error("Error al consultar Gmail:", error);
    const e = error as { code?: number; status?: number; message?: string };
    if (e?.code === 429 || e?.status === 429 || /quota|rate limit/i.test(e?.message ?? "")) {
      return NextResponse.json({ error: "cuota_gmail" }, { status: 429 });
    }
    return NextResponse.json({ error: "error_gmail" }, { status: 502 });
  }
}
