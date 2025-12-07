/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	plugins: [
		require('@tailwindcss/typography'),
	],
	theme: {
		extend: {
			colors: {
				// Defines the corporate palette with semantic names
				brand: '#d4af37',       // Gold accent
				'brand-dark': '#8a7018', // Dark Gold for text accessibility (AA)
				surface: '#000428',     // Dark Navy (end of gradient)
				primary: '#004e92',     // Light Navy (start of gradient)
			},
			fontFamily: {
				// Corporate typography
				sans: ['Outfit', 'sans-serif'],
				serif: ['Outfit', 'sans-serif'], // Modernizing: Unifying typography to Sans-Serif
			},
			backgroundImage: {
				'corporate-gradient': 'linear-gradient(135deg, #004e92 0%, #000428 100%)',
			},
			typography: (theme) => ({
				// Default (Light Mode): Dark text, Gold links/accents
				DEFAULT: {
					css: {
						color: theme('colors.surface'), // Dark Navy Text
						a: {
							color: theme('colors.brand-dark'), // High contrast gold
							'&:hover': {
								color: theme('colors.primary'),
							},
						},
						h1: { color: theme('colors.surface') },
						h2: { color: theme('colors.surface') },
						h3: { color: theme('colors.primary') },
						h4: { color: theme('colors.primary') },
						strong: { color: theme('colors.brand-dark') }, // High contrast gold
						blockquote: {
							borderLeftColor: theme('colors.brand-dark'),
							color: theme('colors.primary'),
							fontStyle: 'italic',
						},
					},
				},
				// Invert (Dark Mode): White text, Gold links/accents
				invert: {
					css: {
						color: '#fff',
						a: {
							color: theme('colors.brand'),
							'&:hover': {
								color: '#fff',
							},
						},
						h1: { color: '#fff' },
						h2: { color: '#fff' },
						h3: { color: theme('colors.brand') },
						h4: { color: theme('colors.brand') },
						strong: { color: theme('colors.brand') },
						blockquote: {
							borderLeftColor: theme('colors.brand'),
							color: '#f0f0f0',
						},
					},
				},
			}),
		},
	},
};
