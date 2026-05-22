import { createFormHook } from "@tanstack/react-form"

import {
	Checkbox,
	Select,
	SubmitButton,
	TextArea,
	TextField,
} from "../components/form-components"
import { fieldContext, formContext } from "./form-context"

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		Select,
		TextArea,
		Checkbox,
	},
	formComponents: {
		SubmitButton,
	},
	fieldContext,
	formContext,
})
