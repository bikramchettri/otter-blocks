/**
 * External dependencies.
 */
import classNames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	TextControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import {
	getObjectFromQueryString,
	getQueryStringFromObject,
	setUtm
} from '../../../helpers/helper-functions.js';

const types = [
	{
		type: 'featuredImage',
		label: __( 'Featured Image', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/featured.svg'
	},
	{
		type: 'author',
		label: __( 'Author Image', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/author.svg'
	},
	{
		type: 'loggedInUser',
		label: __( 'User Image', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/user.svg'
	},
	{
		type: 'logo',
		label: __( 'Website Logo', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/logo.svg'
	},
	{
		type: 'postMeta',
		label: __( 'Post Meta', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/meta.svg',
		isPro: true
	},
	{
		type: 'product',
		label: __( 'Woo Product', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/woo.svg',
		isPro: true
	},
	{
		type: 'acf',
		label: __( 'ACF Image', 'otter-blocks' ),
		icon: window.themeisleGutenberg.assetsPath + '/icons/acf.svg',
		isPro: true
	}
];

const routeBase = window.themeisleGutenberg.restRoot.includes( '?rest_route=' ) ? '/dynamic/&' : '/dynamic/?';

const getRouteBase = url => url.includes( '?rest_route=' ) ? '/dynamic/&' : '/dynamic/?';

const MediaItem = ({
	uid,
	item,
	context,
	isSelected,
	onSelect
}) => {
	const url = window.themeisleGutenberg.restRoot + routeBase + 'type=' + item.type + '&context=' + context + '&uid=' + uid;

	const isDisabled = ( undefined !== item?.isAvailable && ! item?.isAvailable );

	return (
		<li
			tabIndex="0"
			className={ classNames( 'o-media-item', {
				'selected': isSelected,
				'is-disabled': item?.isPro || isDisabled
			}) }
			onClick={ () => isDisabled || item?.isPro ? null : onSelect( url, isSelected ) }
			title={ item.label }
			style={ {
				backgroundImage: `url(' ${ item.icon } ')`
			} }
		>
			<div className="o-media-item-title">{ item.label }</div>

			{ item?.isPro && <span className="o-media-item-label">{ __( 'Pro', 'otter-blocks' ) }</span> }

			{ isDisabled && <span className="o-media-item-label">{ __( 'Plugin not active', 'otter-blocks' ) }</span> }

			{ isSelected && (
				<button
					type="button"
					className="check"
					tabIndex="-1"
					onClick={ () => onSelect( url, true ) }
				>
					<span className="media-modal-icon"></span>
					<span className="screen-reader-text">{ __( 'Deselect', 'otter-blocks' ) }</span>
				</button>
			) }
		</li>
	);
};

const MediaSidebar = ({
	contentTypes,
	attributes,
	changeAttributes
}) => {
	const selected = contentTypes.find( ({ type }) => type === attributes.type );

	return (
		<Fragment>
			<div className="attachment-details">
				{ selected && <h2>{ selected?.label }</h2> }
			</div>

			{ applyFilters( 'otter.dynamicContent.media.controls', '', attributes, changeAttributes ) }

			{ selected && (
				<TextControl
					label={ __( 'Fallback Image', 'otter-blocks' ) }
					value={ attributes.fallback || '' }
					onChange={ fallback => changeAttributes({ fallback }) }
				/>
			) }

			{ ! Boolean( window.themeisleGutenberg.hasPro ) && (
				<div className="o-media-pro-upsell">
					<img src={ window.themeisleGutenberg.assetsPath + '/images/logo-alt.png' } />
					<div className="o-media-pro-upsell-title">{ __( 'Get more with Otter Pro', 'otter-blocks' ) }</div>
					<div className="o-media-pro-upsell-description">{ __( 'Unlock the full power of Dynamic images with Otter Pro', 'otter-blocks' ) }</div>

					<Button
						isPrimary
						target="_blank"
						href={ setUtm( window.themeisleGutenberg.upgradeLink, 'dynamicimage' ) }
					>
						{ __( 'Get Pro Now', 'otter-blocks' ) }
					</Button>
				</div>
			) }
		</Fragment>
	);
};

const MediaContent = ({
	state,
	onSelectImage
}) => {
	const selection = state.get( 'selection' );

	const {
		getCurrentPostId,
		getSelectedBlock,
		isQueryChild
	} = useSelect( select => {
		const getCurrentPostId = select( 'core/editor' ) ? select( 'core/editor' ).getCurrentPostId() : 0;
		const {
			getSelectedBlock,
			getBlockParentsByBlockName
		} = select( 'core/block-editor' );

		const currentBlock = getSelectedBlock();

		return {
			getCurrentPostId: getCurrentPostId || 0,
			getSelectedBlock: currentBlock,
			isQueryChild: 0 < getBlockParentsByBlockName( currentBlock?.clientId, 'core/query' ).length
		};
	}, []);

	const [ contentTypes, setContentTypes ] = useState([]);

	const [ selected, setSelected ] = useState( selection?._single?.attributes?.url );

	const [ attributes, setAttributes ] = useState({});

	const [ uid, setUid ] = useState( Math.floor( Math.random() * 89999999 + 10000000 ) );

	useEffect( () => {
		const filteredTypes = applyFilters( 'otter.dynamicContent.media.options', types );

		setContentTypes( filteredTypes );

		if ( ! ( undefined !== window?.otterCurrentMediaProps?.value && 8 === String( window?.otterCurrentMediaProps?.value ).length ) ) {
			return;
		}

		const blockAttrs = getSelectedBlock.attributes;

		let target = '';

		Object.keys( blockAttrs ).every( key => {
			if ( 'string' === typeof blockAttrs[ key ] && blockAttrs[ key ]?.includes( 'otter/v1/dynamic' ) && blockAttrs[ key ]?.includes( window.otterCurrentMediaProps.value ) ) {
				target = blockAttrs[ key ];
				return false;
			}

			if ( 'object' === typeof blockAttrs[ key ] && blockAttrs[ key ]?.url?.includes( 'otter/v1/dynamic' ) && blockAttrs[ key ]?.url?.includes( window.otterCurrentMediaProps.value ) ) {
				target = blockAttrs[ key ]?.url;
				return false;
			}

			return true;
		});

		const attrs = getObjectFromQueryString( target || '' );
		attrs.uid = uid;
		const url = window.themeisleGutenberg.restRoot + routeBase + getQueryStringFromObject( attrs );
		onSelect( url );
		window.otterCurrentMediaProps = {};
	}, []);

	useEffect( () => {
		const attrs = getObjectFromQueryString( selected || '' );
		setAttributes( attrs );
	}, [ selected ]);

	const changeAttributes = obj => {
		let attrs = { ...attributes };

		Object.keys( obj ).forEach( o => {
			attrs[ o ] = obj[ o ];
		});

		attrs = Object.fromEntries( Object.entries( attrs ).filter( ([ _, v ]) => ( null !== v && '' !== v && undefined !== v ) ) );

		const url = window.themeisleGutenberg.restRoot + routeBase + getQueryStringFromObject( attrs );

		onSelectImage({
			id: uid,
			url
		});

		setAttributes({ ...attrs });
	};

	const onSelect = ( value, reset = false ) => {
		if ( ! reset ) {
			setSelected( value );
		} else {
			setSelected( false );
		}

		return onSelectImage({
			id: uid,
			url: value
		});
	};

	return (
		<Fragment>
			<div className="attachments-browser">
				<ul className="o-media-list">
					{ contentTypes.map( ( item ) => {
						return (
							<MediaItem
								key={ item.type }
								uid={ uid }
								item={ item }
								context={ isQueryChild ? 'query' : getCurrentPostId }
								isSelected={ selected ? selected?.includes( `${ getRouteBase( selected ) }type=${ item.type }` ) : false }
								onSelect={ onSelect }
							/>
						);
					}) }
				</ul>

				{ applyFilters( 'otter.poweredBy', '' ) }
			</div>

			<div className="media-sidebar">
				<MediaSidebar
					contentTypes={ contentTypes }
					attributes={ attributes }
					changeAttributes={ changeAttributes }
				/>
				{ applyFilters( 'otter.feedback', '', 'dynamic-media', __( 'Help us improve Otter Blocks', 'otter-blocks' ) ) }
			</div>
		</Fragment>
	);
};

export default MediaContent;
