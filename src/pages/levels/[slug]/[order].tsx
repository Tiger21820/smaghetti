import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';

import {
	Levels2Page,
	categories,
} from '../../../components/levels/Levels2Page';
import { store } from '../../../store';
import {
	CategorySlug,
	CategoryUserOrder,
	userOrders,
} from '../../../components/levels/Levels2Page/categories';
import {
	GetStaticPathsResult,
	GetStaticPropsContext,
	GetStaticPropsResult,
} from 'next';

type NextLevels2PageProps = {
	slug: CategorySlug;
	order: CategoryUserOrder;
};

export function getStaticPaths(): GetStaticPathsResult {
	return {
		paths: categories
			.filter((c) => c.slug !== 'by-tag')
			.map((c) => {
				return userOrders.map((order) => {
					return {
						params: {
							slug: c.slug,
							order,
						},
					};
				});
			})
			.flat(1),
		fallback: false,
	};
}

export function getStaticProps(
	context: GetStaticPropsContext
): GetStaticPropsResult<NextLevels2PageProps> {
	const { params } = context;
	const slug = params?.slug as CategorySlug;
	const order = (params?.order ?? 'popular') as CategoryUserOrder;

	return {
		props: { slug, order },
	};
}

function NextLevels2Page({ slug, order }: NextLevels2PageProps) {
	const router = useRouter();

	useEffect(() => {
		if (typeof slug !== 'string') {
			router.replace('/levels/all/popular');
		} else if (typeof order !== 'string') {
			router.replace(`/levels/${slug}/popular`);
		}
	}, [slug, order]);

	return (
		<Provider store={store}>
			<Levels2Page
				currentSlug={slug as CategorySlug}
				currentOrder={order as CategoryUserOrder}
				onSlugClick={(newSlug) => {
					router.push(`/levels/${newSlug}/popular`);
				}}
				onUserOrderClick={(newOrder) => {
					router.push(`/levels/${slug}/${newOrder}`);
				}}
			/>
		</Provider>
	);
}

export default NextLevels2Page;
