/**
 * WordPress dependencies
 */
import { pick } from 'lodash';

import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	ContrastChecker,
	InspectorControls,
	MediaPlaceholder
} from '@wordpress/block-editor';

import {
	__experimentalBoxControl as BoxControl,
	BaseControl,
	Button,
	Disabled,
	ExternalLink,
	FontSizePicker,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	Notice
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { useState, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import InspectorHeader from '../../components/inspector-header/index.js';
import { InspectorExtensions } from '../../components/inspector-slot-fill/index.js';
import SyncControlDropdown from '../../components/sync-control-dropdown/index.js';
import BoxShadowControl from '../../components/box-shadow-control/index.js';
import Upsell from '../../components/notice/index.js';
import ButtonToggle from '../../components/button-toggle-control/index.js';
import {
	buildResponsiveGetAttributes,
	buildResponsiveSetAttributes,
	changeActiveStyle,
	getActiveStyle,
	setUtm
} from '../../helpers/helper-functions.js';
import ResponsiveControl from '../../components/responsive-control/index.js';

const styles = [
	{
		label: __( 'Default', 'otter-blocks' ),
		value: 'default',
		isDefault: true
	},
	{
		label: __( 'Boxed', 'otter-blocks' ),
		value: 'boxed'
	}
];

const headingOptions = [
	{
		label: __( 'H2', 'otter-blocks' ),
		value: 'h2'
	},
	{
		label: __( 'H3', 'otter-blocks' ),
		value: 'h3'
	},
	{
		label: __( 'H4', 'otter-blocks' ),
		value: 'h4'
	},
	{
		label: __( 'H5', 'otter-blocks' ),
		value: 'h5'
	},
	{
		label: __( 'H6', 'otter-blocks' ),
		value: 'h6'
	}
];

const defaultFontSizes = [
	{
		name: 14,
		size: '14px'
	},
	{
		name: 16,
		size: '16px'
	},
	{
		name: 18,
		size: '18px'
	},
	{
		name: 24,
		size: '24px'
	},
	{
		name: 28,
		size: '28px'
	}
];

const PanelItem = ({
	title,
	remove,
	children
}) => {
	const [ isOpen, setOpen ] = useState( false );

	return (
		<div className="o-review__inspector_panel_item">
			<div className="o-review__inspector_panel_item__header">
				<Button
					className="o-review__inspector_panel_item__title"
					onClick={ () => setOpen( ! isOpen ) }
				>
					{ title }
				</Button>

				<Button
					icon="no-alt"
					label={ __( 'Remove', 'otter-blocks' ) }
					showTooltip={ true }
					className="o-review__inspector_panel_item__arrow"
					onClick={ remove }
				/>
			</div>

			{ isOpen && (
				<div className="o-review__inspector_panel_item__content">
					{ children }
				</div>
			) }
		</div>
	);
};

/**
 *
 * @param {import('./type.js').ReviewInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	getValue,
	productAttributes
}) => {
	const [ tab, setTab ] = useState( 'settings' );

	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const view = __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();

		return {
			responsiveSetAttributes: buildResponsiveSetAttributes( setAttributes, view ),
			responsiveGetAttributes: buildResponsiveGetAttributes( view )
		};
	}, []);

	const addFeature = () => {
		const features = [ ...attributes.features ];
		features.push({
			title: __( 'Feature', 'otter-blocks' ),
			rating: 9
		});
		setAttributes({ features });
	};

	const changeFeature = ( index, value ) => {
		const features = [ ...attributes.features ];
		features[ index ] = {
			...features[ index ],
			...value
		};
		setAttributes({ features });
	};

	const removeFeature = ( index ) => {
		let features = [ ...attributes.features ];
		features = features.filter( ( el, i ) => i !== index );
		setAttributes({ features });
	};

	const addPro = () => {
		const pros = [ ...attributes.pros ];
		pros.push( '' );
		setAttributes({ pros });
	};

	const changePro = ( index, value ) => {
		const pros = [ ...attributes.pros ];
		pros[ index ] = value;
		setAttributes({ pros });
	};

	const removePro = ( index ) => {
		let pros = [ ...attributes.pros ];
		pros = pros.filter( ( el, i ) => i !== index );
		setAttributes({ pros });
	};

	const addCon = () => {
		const cons = [ ...attributes.cons ];
		cons.push( '' );
		setAttributes({ cons });
	};

	const changeCon = ( index, value ) => {
		const cons = [ ...attributes.cons ];
		cons[ index ] = value;
		setAttributes({ cons });
	};

	const removeCon = ( index ) => {
		let cons = [ ...attributes.cons ];
		cons = cons.filter( ( el, i ) => i !== index );
		setAttributes({ cons });
	};

	const addLinks = () => {
		const links = [ ...attributes.links ];
		links.push({
			label: __( 'Buy Now', 'otter-blocks' ),
			href: ''
		});
		setAttributes({ links });
	};

	const changeLinks = ( index, value ) => {
		const links = [ ...attributes.links ];
		links[ index ] = {
			...links[ index ],
			...value
		};
		setAttributes({ links });
	};

	const removeLinks = index => {
		let links = [ ...attributes.links ];
		links = links.filter( ( el, i ) => i !== index );
		setAttributes({ links });
	};

	const changeStructure = value => {
		const classes = attributes?.className?.split( ' ' ) || [];

		if ( 'default' === value && classes.includes( 'is-style-single-column' ) ) {
			classes.splice( classes.indexOf( 'is-style-single-column' ), 1 );
		} else if ( 'is-style-single-column' === value && ! classes.includes( 'is-style-single-column' ) ) {
			classes.push( 'is-style-single-column' );
		}

		setAttributes({ className: classes.join( ' ' ) });
	};

	const changeStyle = value => {
		const classes = changeActiveStyle( attributes?.className, styles, value );
		setAttributes({ className: classes });
	};

	const changeBoxShadow = data => {
		const boxShadow = { ...attributes.boxShadow };
		Object.entries( data ).map( ([ key, val ] = data ) => {
			boxShadow[key] = val;
		});

		setAttributes({ boxShadow });
	};

	const colorControls = [
		{
			label: __( 'Background', 'otter-blocks' ),
			value: 'backgroundColor'
		},
		{
			label: __( 'Text', 'otter-blocks' ),
			value: 'textColor'
		},
		{
			label: __( 'Button', 'otter-blocks' ),
			value: 'primaryColor'
		},
		{
			label: __( 'Button Text', 'otter-blocks' ),
			value: 'buttonTextColor'
		},
		{
			label: __( 'Border', 'otter-blocks' ),
			value: 'borderColor'
		},
		{
			label: __( 'Stars', 'otter-blocks' ),
			value: 'starsColor'
		},
		{
			label: __( 'Pros', 'otter-blocks' ),
			value: 'prosColor'
		},
		{
			label: __( 'Cons', 'otter-blocks' ),
			value: 'consColor'
		}
	];

	return (
		<InspectorControls>
			<InspectorHeader
				value={ tab }
				options={[
					{
						label: __( 'Settings', 'otter-blocks' ),
						value: 'settings'
					},
					{
						label: __( 'Style', 'otter-blocks' ),
						value: 'style'
					}
				]}
				onChange={ setTab }
			/>

			{ 'settings' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Settings', 'otter-blocks' ) }
					>
						<ButtonToggle
							label={ __( 'Column Structure', 'otter-blocks' ) }
							options={[
								{
									label: __( 'One Column', 'otter-blocks' ),
									value: 'is-style-single-column'
								},
								{
									label: __( 'Two Columns', 'otter-blocks' ),
									value: 'default'
								}
							]}
							value={ attributes?.className?.includes( 'is-style-single-column' ) ? 'is-style-single-column' : 'default' }
							onChange={ changeStructure }
						/>

						<ButtonToggle
							label={ __( 'Rating Scale', 'otter-blocks' ) }
							options={[
								{
									label: __( '1-10', 'otter-blocks' ),
									value: 'full'
								},
								{
									label: __( '1-5', 'otter-blocks' ),
									value: 'half'
								}
							]}
							value={ attributes.scale || 'full' }
							onChange={ scale => setAttributes({ scale }) }
						/>

						{ ( attributes.image || productAttributes?.image ) && (
							<ButtonToggle
								label={ __( 'Image Width', 'otter-blocks' ) }
								options={[
									{
										label: __( '25%', 'otter-blocks' ),
										value: 25
									},
									{
										label: __( '33%', 'otter-blocks' ),
										value: 33
									},
									{
										label: __( '50%', 'otter-blocks' ),
										value: 50
									},
									{
										label: __( '100%', 'otter-blocks' ),
										value: 100
									}
								]}
								value={ attributes.imageWidth || 33 }
								onChange={ imageWidth => setAttributes({ imageWidth: Number( imageWidth ) }) }
							/>
						) }
					</PanelBody>

					<PanelBody
						title={ __( 'Product Details', 'otter-blocks' ) }
						initialOpen={ false }
					>
						{ attributes.product && (
							<Notice
								status="warning"
								isDismissible={ false }
								className="o-html-anchor-control-notice"
							>
								{ __( 'WooCommerce product synchronization is active. Some options might be disabled.', 'otter-blocks' ) }
							</Notice>
						) }

						<TextControl
							label={ __( 'Product Name', 'otter-blocks' ) }
							type="text"
							placeholder={ __( 'Name of your product…', 'otter-blocks' ) }
							value={ productAttributes?.title || attributes.title }
							disabled={ attributes.product }
							onChange={ title => setAttributes({ title }) }
						/>

						<BaseControl>
							<TextControl
								label={ __( 'Currency', 'otter-blocks' ) }
								type="text"
								placeholder={ __( 'Currency code, like USD or EUR.', 'otter-blocks' ) }
								value={ productAttributes?.currency || attributes.currency }
								disabled={ attributes.product }
								onChange={ currency => setAttributes({ currency }) }
							/>

							{ __( 'Currency code in three digit ISO 4217 code.', 'otter-blocks' ) + ' ' }

							<ExternalLink href="https://en.wikipedia.org/wiki/ISO_4217#Active_codes">
								{ __( 'List of ISO 4217 codes.', 'otter-blocks' ) }
							</ExternalLink>
						</BaseControl>

						<TextControl
							label={ __( 'Price', 'otter-blocks' ) }
							type="number"
							value={ productAttributes?.price || attributes.price }
							disabled={ attributes.product }
							onChange={ value => setAttributes({ price: '' !== value ? Number( value ) : undefined }) }
						/>

						<TextControl
							label={ __( 'Discounted Price', 'otter-blocks' ) }
							type="number"
							value={ productAttributes?.discounted || attributes.discounted }
							disabled={ attributes.product }
							onChange={ value => setAttributes({ discounted: '' !== value ? Number( value ) : undefined }) }
						/>

						{ ! ( attributes.image || productAttributes?.image ) ? (
							<MediaPlaceholder
								labels={ {
									title: __( 'Product Image', 'otter-blocks' )
								} }
								accept="image/*"
								allowedTypes={ [ 'image' ] }
								value={ attributes.image }
								onSelect={ value => setAttributes({ image: pick( value, [ 'id', 'alt', 'url' ]) }) }
							/>
						) : (
							<BaseControl
								className="o-review__inspector_image"
							>
								<img
									src={ productAttributes?.image?.url || attributes.image.url }
									alt={ productAttributes?.image?.url || attributes.image.alt }
								/>

								<Button
									isSecondary
									onClick={ () => setAttributes({ image: undefined }) }
									disabled={ attributes.product }
								>
									{ __( 'Remove image', 'otter-blocks' ) }
								</Button>
							</BaseControl>
						) }
					</PanelBody>

					<PanelBody
						title={ __( 'Product Features', 'otter-blocks' ) }
						initialOpen={ false }
					>
						{ 0 < attributes.features.length && attributes.features.map( ( feature, index ) => (
							<PanelItem
								key={ index }
								title={ feature.title || __( 'Feature', 'otter-blocks' ) }
								remove={ () => removeFeature( index ) }
							>
								<TextControl
									label={ __( 'Title', 'otter-blocks' ) }
									type="text"
									placeholder={ __( 'Feature title', 'otter-blocks' ) }
									value={ feature.title }
									onChange={ title => changeFeature( index, { title }) }
								/>

								<RangeControl
									label={ __( 'Rating', 'otter-blocks' ) }
									value={ feature.rating }
									onChange={ value => changeFeature( index, { rating: Number( value ) }) }
									step={ 0.1 }
									min={ 1 }
									max={ 10 }
								/>
							</PanelItem>
						) ) }

						<Button
							isSecondary
							className="o-review__inspector_add"
							onClick={ addFeature }
						>
							{ __( 'Add Feature', 'otter-blocks' ) }
						</Button>
					</PanelBody>

					<PanelBody
						title={ __( 'Pros', 'otter-blocks' ) }
						initialOpen={ false }
					>
						{ 0 < attributes.pros.length && attributes.pros.map( ( pro, index ) => (
							<PanelItem
								key={ index }
								title={ pro || __( 'Pro', 'otter-blocks' ) }
								remove={ () => removePro( index ) }
							>
								<TextControl
									label={ __( 'Title', 'otter-blocks' ) }
									type="text"
									placeholder={ __( 'Why do you like the product?', 'otter-blocks' ) }
									value={ pro }
									onChange={ value => changePro( index, value ) }
								/>
							</PanelItem>
						) ) }

						<Button
							isSecondary
							className="o-review__inspector_add"
							onClick={ addPro }
						>
							{ __( 'Add Item', 'otter-blocks' ) }
						</Button>
					</PanelBody>

					<PanelBody
						title={ __( 'Cons', 'otter-blocks' ) }
						initialOpen={ false }
					>
						{ 0 < attributes.cons.length && attributes.cons.map( ( con, index ) => (
							<PanelItem
								key={ index }
								title={ con || __( 'Con', 'otter-blocks' ) }
								remove={ () => removeCon( index ) }
							>
								<TextControl
									label={ __( 'Title', 'otter-blocks' ) }
									type="text"
									placeholder={ __( 'What can be improved?', 'otter-blocks' ) }
									value={ con }
									onChange={ value => changeCon( index, value ) }
								/>
							</PanelItem>
						) ) }

						<Button
							isSecondary
							className="o-review__inspector_add"
							onClick={ addCon }
						>
							{ __( 'Add Item', 'otter-blocks' ) }
						</Button>
					</PanelBody>

					<PanelBody
						title={ __( 'Buttons', 'otter-blocks' ) }
						initialOpen={ false }
					>
						{ attributes.product && (
							<Notice
								status="warning"
								isDismissible={ false }
								className="o-html-anchor-control-notice"
							>
								{ __( 'WooCommerce product synchronization is active. Some options might be disabled.', 'otter-blocks' ) }
							</Notice>
						) }

						{ 0 < productAttributes?.links?.length && productAttributes?.links?.map( ( link, index ) => (
							<PanelItem
								key={ index }
								title={ link.label || __( 'Link', 'otter-blocks' ) }
								remove={ () => removeLinks( index ) }
							>
								<TextControl
									label={ __( 'Label', 'otter-blocks' ) }
									type="text"
									placeholder={ __( 'Button label', 'otter-blocks' ) }
									disabled={ attributes.product }
									value={ link.label }
								/>

								<TextControl
									label={ __( 'Link', 'otter-blocks' ) }
									type="url"
									placeholder={ 'https://…' }
									value={ link.href }
									disabled={ attributes.product }
								/>

								<ToggleControl
									label={ __( 'Is this Sponsored?', 'otter-blocks' ) }
									checked={ link.isSponsored }
									disabled={ attributes.product }
								/>
							</PanelItem>
						) ) }

						{ ! ( 0 < productAttributes?.links?.length ) && (
							<Fragment>
								{ 0 < attributes.links.length && attributes.links.map( ( link, index ) => (
									<PanelItem
										key={ index }
										title={ link.label || __( 'Link', 'otter-blocks' ) }
										remove={ () => removeLinks( index ) }
									>
										<TextControl
											label={ __( 'Label', 'otter-blocks' ) }
											type="text"
											placeholder={ __( 'Button label', 'otter-blocks' ) }
											value={ link.label }
											onChange={ label => changeLinks( index, { label }) }
										/>

										<TextControl
											label={ __( 'Link', 'otter-blocks' ) }
											type="url"
											placeholder={ 'https://…' }
											value={ link.href }
											onChange={ href => changeLinks( index, { href }) }
										/>

										<ToggleControl
											label={ __( 'Is this Sponsored?', 'otter-blocks' ) }
											checked={ link.isSponsored }
											onChange={ () => changeLinks( index, { isSponsored: ! link.isSponsored }) }
										/>
									</PanelItem>
								) ) }

								<Button
									isSecondary
									className="o-review__inspector_add"
									onClick={ addLinks }
								>
									{ __( 'Add Links', 'otter-blocks' ) }
								</Button>
							</Fragment>
						) }
					</PanelBody>

					<PanelBody
						title={ __( 'Labels', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<TextControl
							label={ __( 'Pros', 'otter-blocks' ) }
							value={ attributes.prosLabel }
							onChange={ prosLabel => setAttributes({ prosLabel }) }
						/>

						<TextControl
							label={ __( 'Cons', 'otter-blocks' ) }
							value={ attributes.consLabel }
							onChange={ consLabel => setAttributes({ consLabel }) }
						/>

						<TextControl
							label={ __( 'Buttons', 'otter-blocks' ) }
							value={ attributes.buttonsLabel }
							onChange={ buttonsLabel => setAttributes({ buttonsLabel }) }
						/>
					</PanelBody>
				</Fragment>
			) }

			{ 'style' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Style', 'otter-blocks' ) }
					>
						<ButtonToggle
							options={ styles }
							value={ getActiveStyle( styles, attributes?.className ) }
							onChange={ changeStyle }
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Typography', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<SelectControl
							label={ __( 'Main Heading', 'otter-blocks' ) }
							help={ __( 'Product Title HTML Tag', 'otter-blocks' ) }
							options={ headingOptions }
							value={ attributes.mainHeading || 'h2' }
							onChange={ mainHeading => setAttributes({ mainHeading }) }
						/>

						<SelectControl
							label={ __( 'Sub Heading', 'otter-blocks' ) }
							help={ __( 'Pros and Cons titles HTML Tag', 'otter-blocks' ) }
							options={ headingOptions }
							value={ attributes.subHeading || 'h3' }
							onChange={ subHeading => setAttributes({ subHeading }) }
						/>

						<BaseControl
							label={ __( 'Content Font Size', 'otter-blocks' ) }
						>
							<FontSizePicker
								fontSizes={ defaultFontSizes }
								withReset
								value={ attributes.contentFontSize }
								onChange={ contentFontSize => setAttributes({ contentFontSize }) }
							/>
						</BaseControl>
					</PanelBody>

					<PanelBody
						title={ __( 'Color', 'otter-blocks' ) }
						initialOpen={ false }
						className="o-review__inspector_color"
					>
						<SyncControlDropdown
							isSynced={ attributes.isSynced }
							options={ colorControls }
							setAttributes={ setAttributes }
						/>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'backgroundColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Background', 'otter-blocks' ) }
								colorValue={ getValue( 'backgroundColor' ) }
								onColorChange={ e => setAttributes({ backgroundColor: e }) }
							/>
						</Disabled>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'textColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Text', 'otter-blocks' ) }
								colorValue={ getValue( 'textColor' ) }
								onColorChange={ e => setAttributes({ textColor: e }) }
							/>
						</Disabled>

						<ContrastChecker
							{ ...{
								textColor: getValue( 'textColor' ),
								backgroundColor: getValue( 'backgroundColor' )
							} }
						/>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'primaryColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Button', 'otter-blocks' ) }
								colorValue={ getValue( 'primaryColor' ) }
								onColorChange={ e => setAttributes({ primaryColor: e }) }
							/>
						</Disabled>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'buttonTextColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Button Text', 'otter-blocks' ) }
								colorValue={ getValue( 'buttonTextColor' ) }
								onColorChange={ e => setAttributes({ buttonTextColor: e }) }
							/>
						</Disabled>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'borderColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Border', 'otter-blocks' ) }
								colorValue={ getValue( 'borderColor' ) }
								onColorChange={ e => setAttributes({ borderColor: e }) }
							/>
						</Disabled>

						<ContrastChecker
							{ ...{
								textColor: getValue( 'buttonTextColor' ),
								backgroundColor: getValue( 'primaryColor' )
							} }
						/>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'starsColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Stars', 'otter-blocks' ) }
								colorValue={ getValue( 'starsColor' ) }
								onColorChange={ e => setAttributes({ starsColor: e }) }
							/>
						</Disabled>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'prosColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Pros', 'otter-blocks' ) }
								colorValue={ getValue( 'prosColor' ) }
								onColorChange={ e => setAttributes({ prosColor: e }) }
							/>
						</Disabled>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'consColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Cons Color', 'otter-blocks' ) }
								colorValue={ getValue( 'consColor' ) }
								onColorChange={ e => setAttributes({ consColor: e }) }
							/>
						</Disabled>
					</PanelBody>

					<PanelBody
						title={ __( 'Dimensions', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<ResponsiveControl
							label={ __( 'Screen Type', 'otter-blocks' ) }
						>
							<BoxControl
								label={ __( 'Padding', 'otter-blocks' ) }
								values={ responsiveGetAttributes([ attributes.padding, attributes.paddingTablet, attributes.paddingMobile ]) }
								onChange={ value => responsiveSetAttributes( value, [ 'padding', 'paddingTablet', 'paddingMobile' ]) }
							/>
						</ResponsiveControl>
					</PanelBody>

					<PanelBody
						title={ __( 'Border', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<RangeControl
							label={ __( 'Width', 'otter-blocks' ) }
							value={ attributes.borderWidth }
							onChange={ e => setAttributes({ borderWidth: e }) }
							min={ 0 }
							max={ 50 }
							allowReset
						/>

						<RangeControl
							label={ __( 'Radius', 'otter-blocks' ) }
							value={ attributes.borderRadius }
							onChange={ e => setAttributes({ borderRadius: e }) }
							min={ 0 }
							max={ 100 }
							allowReset
						/>

						<BoxShadowControl
							boxShadow={ attributes.boxShadow }
							onChange={ changeBoxShadow }
						/>
					</PanelBody>
				</Fragment>
			) }

			{ ( ! Boolean( window.themeisleGutenberg.hasPro ) ) && (
				<PanelBody
					title={ __( 'More Features', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<Upsell
						notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'reviewblock' ) }>{ __( 'Get more options with Otter Pro. ', 'otter-blocks' ) }</ExternalLink> }
						variant="upsell"
					/>
				</PanelBody>
			) }

			<InspectorExtensions/>
		</InspectorControls>
	);
};

export default Inspector;
