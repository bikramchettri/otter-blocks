/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { assign } from 'lodash';

import { registerBlockVariation } from '@wordpress/blocks';

import { createHigherOrderComponent } from '@wordpress/compose';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import { masonryIcon as icon } from '../../helpers/icons.js';
import Edit from './edit.js';

const addAttribute = ( props ) => {
	if ( 'core/gallery' === props.name ) {
		props.attributes = assign( props.attributes, {
			isMasonry: {
				type: 'boolean',
				default: false
			},
			margin: {
				type: 'number'
			}
		});
	}

	return props;
};

const withMasonryExtension = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( 'core/gallery' !== props.name ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<Edit
				BlockEdit={ BlockEdit }
				props={ props }
			/>
		);
	};
}, 'withMasonryExtension' );

addFilter( 'blocks.registerBlockType', 'themeisle-gutenberg/masonry-extension-attributes', addAttribute );
addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/masonry-extension', withMasonryExtension );

registerBlockVariation( 'core/gallery', {
	name: 'themeisle-gutenberg/masonry',
	title: __( 'Masonry', 'otter-blocks' ),
	description: __( 'Display multiple images in a rich masonry layout.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	attributes: {
		isMasonry: true
	}
});
