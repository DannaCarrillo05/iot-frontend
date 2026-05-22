import { isMatch, useMatches } from "@tanstack/react-router"
import { Fragment } from "react/jsx-runtime"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "./ui/breadcrumb"

export function AppBreadcrumb() {
	const matches = useMatches()
	const matchesWithCrumbs = matches.filter((match) =>
		isMatch(match, "loaderData.crumb"),
	)

	const items = matchesWithCrumbs.map(({ pathname, loaderData }) => ({
		href: pathname,
		label: loaderData?.crumb as string,
	}))
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{items.map((breadcrumb, index) => {
					const isLastItem = index === items.length - 1

					return (
						<Fragment key={breadcrumb.href}>
							<BreadcrumbItem>
								{!isLastItem ? (
									<BreadcrumbLink href={breadcrumb.href}>
										{breadcrumb.label}
									</BreadcrumbLink>
								) : (
									<BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
								)}
							</BreadcrumbItem>
							{!isLastItem && (
								<BreadcrumbSeparator className="hidden md:block" />
							)}
						</Fragment>
					)
				})}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
