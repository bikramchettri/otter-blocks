/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	InspectorControls
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	RangeControl,
	FontSizePicker,
	ToggleControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl
} from '@wordpress/components';

import { select, dispatch, useSelect } from '@wordpress/data';

import { Fragment, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import GoogleFontsControl from '../../../components/google-fonts-control';
import ClearButton from '../../../components/clear-button';
import BoxShadowControl from '../../../components/box-shadow-control';
import IconPickerControl from '../../../components/icon-picker-control';
import InspectorHeader from '../../../components/inspector-header';
import { InspectorExtensions } from '../../../components/inspector-slot-fill';
import ButtonToggle from '../../../components/button-toggle-control';
import {
	buildResponsiveGetAttributes,
	buildResponsiveSetAttributes,
	changeActiveStyle,
	getActiveStyle
} from '../../../helpers/helper-functions';
import SyncColorPanel from '../../../components/sync-color-panel';
import ResponsiveControl from '../../../components/responsive-control';

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

const gapCompatibility = {
	narrow: 5,
	wide: 10,
	wider: 20
};

/**
 *
 * @param {import('./types.js').AccordionGroupInspectorProps} props
 * @returns
 */
const Inspector = ({
	clientId,
	attributes,
	setAttributes,
	getValue
}) => {
	const [ tab, setTab ] = useState( 'settings' );

	const globalColorControls = [
		{
			label: __( 'Title', 'otter-blocks' ),
			slug: 'titleColor',
			value: getValue( 'titleColor' )
		},
		{
			label: __( 'Active Tab Title', 'otter-blocks' ),
			slug: 'activeTitleColor',
			value: getValue( 'activeTitleColor' )
		},
		{
			label: __( 'Title Background', 'otter-blocks' ),
			slug: 'titleBackground',
			value: getValue( 'titleBackground' )
		},
		{
			label: __( 'Active Tab Title Background', 'otter-blocks' ),
			slug: 'activeTitleBackground',
			value: getValue( 'activeTitleBackground' )
		},
		{
			label: __( 'Content Background', 'otter-blocks' ),
			slug: 'contentBackground',
			value: getValue( 'contentBackground' )
		},
		{
			label: __( 'Border', 'otter-blocks' ),
			slug: 'borderColor',
			value: getValue( 'borderColor' )
		}
	];

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

	const changeFontFamily = value => {
		if ( ! value ) {
			setAttributes({
				fontFamily: value,
				fontVariant: value
			});
		} else {
			setAttributes({
				fontFamily: value,
				fontVariant: 'normal',
				fontStyle: 'normal'
			});
		}
	};

	const changeBoxShadow = data => {
		const boxShadow = { ...attributes.boxShadow };
		Object.entries( data ).map( ([ key, val ] = data ) => {
			boxShadow[key] = val;
		});

		setAttributes({ boxShadow });
	};

	const onAlwaysOpenToggle = alwaysOpen => {
		setAttributes({ alwaysOpen });

		if ( true === alwaysOpen ) {
			return;
		}

		const children = select( 'core/block-editor' ).getBlocksByClientId( clientId )[0].innerBlocks;
		children.forEach( child => {
			dispatch( 'core/block-editor' ).updateBlockAttributes( child.clientId, { initialOpen: false });
		});
	};

	const onTagChange = ( targetTag ) => {
		const children = select( 'core/block-editor' ).getBlocksByClientId( clientId )[0].innerBlocks;
		children.forEach( child => {
			dispatch( 'core/block-editor' ).updateBlockAttributes( child.clientId, { tag: targetTag });
		});

		setAttributes({ tag: targetTag });
	};

	const changeStyle = value => {
		const classes = changeActiveStyle( attributes?.className, styles, value );
		setAttributes({ className: classes });
	};

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
				<PanelBody
					title={ __( 'Settings', 'otter-blocks' ) }
				>
					<ToggleControl
						label={ __( 'Place icon before text', 'otter-blocks' ) }
						checked={ attributes.iconFirst }
						onChange={ iconFirst => setAttributes({ iconFirst }) }
					/>
					<ToggleControl
						label={ __( 'Keep multiple items expanded', 'otter-blocks' ) }
						help={ __( 'When enabled, multiple accordion items can be expanded at the same time', 'otter-blocks' ) }
						checked={ attributes.alwaysOpen || false }
						onChange={ onAlwaysOpenToggle }
					/>
					<ToggleControl
						label={ __( 'Enable FAQ Schema', 'otter-blocks' ) }
						checked={ attributes.schema }
					/>
					<SelectControl
						label={ __( 'Accordion title HTML tag', 'otter-blocks' ) }
						value={ attributes.tag || 'div' }
						options={ [
							{ label: __( 'H1', 'otter-blocks' ), value: 'h1' },
							{ label: __( 'H2', 'otter-blocks' ), value: 'h2' },
							{ label: __( 'H3', 'otter-blocks' ), value: 'h3' },
							{ label: __( 'H4', 'otter-blocks' ), value: 'h4' },
							{ label: __( 'H5', 'otter-blocks' ), value: 'h5' },
							{ label: __( 'H6', 'otter-blocks' ), value: 'h6' },
							{ label: __( 'div', 'otter-blocks' ), value: 'div' }
						] }
						onChange={ onTagChange }
					/>
				</PanelBody>
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
						title={ __( 'Title Typography', 'otter-blocks' ) }
					>
						<FontSizePicker
							value={ attributes.fontSize }
							fontSizes={ [
								{
									name: __( 'Extra Small', 'otter-blocks' ),
									slug: 'extra-small',
									size: 14
								},
								{
									name: __( 'Small', 'otter-blocks' ),
									slug: 'small',
									size: 16
								},
								{
									name: __( 'Medium', 'otter-blocks' ),
									slug: 'medium',
									size: 18
								},
								{
									name: __( 'Large', 'otter-blocks' ),
									slug: 'large',
									size: 24
								},
								{
									name: __( 'Extra Large', 'otter-blocks' ),
									slug: 'extra-large',
									size: 28
								}
							] }
							onChange={ fontSize => setAttributes({ fontSize }) }
						/>

						<GoogleFontsControl
							label={ __( 'Font Family', 'otter-blocks' ) }
							value={ attributes.fontFamily }
							onChangeFontFamily={ changeFontFamily }
							valueVariant={ attributes.fontVariant }
							onChangeFontVariant={ fontVariant => setAttributes({ fontVariant }) }
							valueStyle={ attributes.fontStyle }
							onChangeFontStyle={ fontStyle => setAttributes({ fontStyle }) }
							valueTransform={ attributes.textTransform }
							onChangeTextTransform={ textTransform => setAttributes({ textTransform }) }
						/>

						<ClearButton
							values={[ 'fontFamily', 'fontVariant', 'fontStyle', 'textTransform' ]}
							setAttributes={ setAttributes }
						/>

						<RangeControl
							label={ __( 'Letter Spacing', 'otter-blocks' ) }
							value={ attributes.letterSpacing }
							onChange={ letterSpacing => setAttributes({ letterSpacing }) }
							min={ -50 }
							max={ 100 }
							allowReset={ true }
						/>
					</PanelBody>

					<SyncColorPanel
						label={ __( 'Color', 'otter-blocks' ) }
						isSynced={ attributes.isSynced }
						options={ globalColorControls }
						setAttributes={ setAttributes }
					>
						<ContrastChecker
							{ ...{
								textColor: getValue( 'titleColor' ),
								backgroundColor: getValue( 'titleBackground' )
							} }
						/>

						<ContrastChecker
							{ ...{
								textColor: getValue( 'activeTitleColor' ),
								backgroundColor: getValue( 'activeTitleBackground' )
							} }
						/>
					</SyncColorPanel>

					<PanelBody
						title={ __( 'Dimensions (Layout)', 'otter-blocks' ) }
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
						<RangeControl
							label={ __( 'Gap between panels', 'otter-blocks' ) }
							value={ 'string' === typeof attributes.gap ? gapCompatibility[attributes.gap] : attributes.gap }
							onChange={ gap => setAttributes({ gap }) }
							allowReset
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Icons', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<IconPickerControl
							label={ __( 'Closed Item Icon', 'otter-blocks' ) }
							library="fontawesome"
							prefix={ attributes.icon?.prefix }
							icon={ attributes.icon?.name }
							allowThemeisleIcons={ false }
							onChange={ icon => setAttributes({ icon }) }
						/>

						<IconPickerControl
							label={ __( 'Open Item Icon', 'otter-blocks' ) }
							library="fontawesome"
							prefix={ attributes.openItemIcon?.prefix }
							icon={ attributes.openItemIcon?.name }
							allowThemeisleIcons={ false }
							onChange={ openItemIcon => setAttributes({ openItemIcon }) }
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Border', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<SelectControl
							label={ __( 'Border Style', 'otter-blocks' ) }
							labelPosition="left"
							value={ attributes.borderStyle }
							options={[
								{ label: __( 'Solid', 'otter-blocks' ), value: 'solid' },
								{ label: __( 'Dashed', 'otter-blocks' ), value: 'dashed' },
								{ label: __( 'Dotted', 'otter-blocks' ), value: 'dotted' }
							]}
							onChange={ borderStyle => setAttributes({ borderStyle }) }
						/>
						<UnitControl
							label={ __( 'Width', 'otter-blocks' ) }
							value={ attributes.borderWidth }
							onChange={ borderWidth => setAttributes({ borderWidth }) }
						/>
						<BoxShadowControl
							boxShadow={ attributes.boxShadow }
							onChange={ changeBoxShadow }
						/>
					</PanelBody>
				</Fragment>
			) }

			<InspectorExtensions/>
		</InspectorControls>
	);
};

export default Inspector;
