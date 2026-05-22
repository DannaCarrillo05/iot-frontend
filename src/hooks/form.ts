import { createFormHook } from "@tanstack/react-form"

import {
	Checkbox,
	Select,
	Slider,
	SubmitButton,
	Switch,
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
		Slider,
		Switch,
	},
	formComponents: {
		SubmitButton,
	},
	fieldContext,
	formContext,
})
