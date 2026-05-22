import { APIError } from "better-auth"
import { v7 as uuidv7 } from "uuid"

export const ERROR_MESSAGES: Record<string, string> = {
	UNAUTHORIZED:
		"El correo o la contraseña son incorrectos. Verifica tus credenciales e intenta nuevamente.",
	BAD_REQUEST: "Por favor, completa todos los campos correctamente.",
	FORBIDDEN:
		"No tienes permisos para acceder. Si crees que esto es un error, contacta al soporte.",
	NOT_FOUND:
		"El correo o la contraseña son incorrectos. Verifica tus credenciales e intenta nuevamente.",
	TOO_MANY_REQUESTS:
		"Has realizado demasiados intentos. Espera unos minutos antes de volver a intentar.",
	INTERNAL_SERVER_ERROR:
		"Lo sentimos, hubo un problema con el servidor. Por favor, intenta más tarde o contacta al soporte si el problema persiste.",
	SERVICE_UNAVAILABLE:
		"El servicio no está disponible en este momento. Por favor, intenta más tarde.",
}

export function handleAuthError(error: unknown): { form: string } {
	const errorId = uuidv7()

	if (error instanceof APIError) {
		const message =
			ERROR_MESSAGES[error.status] ??
			"Ocurrió un error inesperado. Por favor, intenta nuevamente."

		if (!ERROR_MESSAGES[error.status]) {
			console.error("Error de autenticación no manejado:", error)
		}

		return { form: message }
	}

	console.error(`Error inesperado: ${errorId}`, error)
	return {
		form: `Ocurrió un error inesperado. Si el problema continúa, contacta al soporte y menciona el código de error: ${errorId}`,
	}
}
