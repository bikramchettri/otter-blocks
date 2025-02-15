/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalToolsPanelItem as ToolsPanelItem,
	Button,
	Modal,
	TextControl,
	FormTokenField,
	ToggleControl,
	Notice, SelectControl
} from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import { useState, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Notice as OtterNotice } from '../../../blocks/components';
import { RichTextEditor } from '../../../blocks/components';
import { FieldInputWidth, HideFieldLabelToggle } from '../../../blocks/blocks/form/common';
import { setSavedState } from '../../../blocks/helpers/helper-functions';

// +-------------- Autoresponder --------------+

const AutoresponderBody = ({ formOptions, setFormOption }) => {
	const [ isOpen, setOpen ] = useState( false );
	const onChange = body => {
		setFormOption({ autoresponder: { ...formOptions.autoresponder, body }});
	};

	return (
		<>
			{ isOpen && (
				<Modal
					title={ __( 'Autoresponder Body' ) }
					onRequestClose={() => setOpen( false )}
					shouldCloseOnClickOutside={ false }
				>
					<RichTextEditor
						value={ formOptions.autoresponder?.body }
						onChange={ onChange }
						help={ __( 'Enter the body of the autoresponder email.', 'otter-blocks' ) }
						allowRawHTML
					/>
				</Modal>
			) }
			<br/>
			<Button
				variant="secondary"
				onClick={() => setOpen( true )}
			>
				{ __( 'Add Autoresponder Body', 'otter-blocks' ) }
			</Button>
		</>
	);
};

const helpMessages = {
	'database': __( 'Save form submissions to the database. You can see the submissions in Otter Blocks > Form Submissions on Dashboard Panel', 'otter-blocks' ),
	'email': __( 'The submissions are send only via email. No data will be saved on the server, use this option to handle sensitive data.', 'otter-blocks' ),
	'database-email': __( 'Save the submissions to the database and notify also via email.', 'otter-blocks' )
};


const FormOptions = ( Options, formOptions, setFormOption, config ) => {

	return (
		<>
			{Options}

			<ToolsPanelItem
				hasValue={ () => undefined !== formOptions.submissionsSaveLocation }
				label={ __( 'Submissions', 'otter-blocks' ) }
				onDeselect={ () => setFormOption({ submissionsSaveLocation: undefined }) }
				isShownByDefault={ true }
			>
				{Boolean( window.otterPro.isActive ) ? (
					<SelectControl
						label={ __( 'Save Location', 'otter-blocks' ) }
						value={ formOptions.submissionsSaveLocation ?? 'database-email' }
						onChange={ submissionsSaveLocation => setFormOption({ submissionsSaveLocation }) }
						options={
							[
								{ label: __( 'Database', 'otter-blocks' ), value: 'database' },
								{ label: __( 'Email Only', 'otter-blocks' ), value: 'email' },
								{ label: __( 'Database and Email', 'otter-blocks' ), value: 'database-email' }
							]
						}
						help={ helpMessages?.[formOptions?.submissionsSaveLocation] ?? helpMessages.database }
					/> ) : (
					<div>
						<OtterNotice
							notice={__(
								'You need to activate Otter Pro.',
								'otter-blocks'
							)}
							instructions={__(
								'You need to activate your Otter Pro license to use Pro features of Form Block.',
								'otter-blocks'
							)}
						/>
					</div>
				)}
			</ToolsPanelItem>

			<ToolsPanelItem
				hasValue={() =>
					undefined !== formOptions.autoresponder?.subject ||
					undefined !== formOptions.autoresponder?.body
				}
				label={__( 'Autoresponder', 'otter-blocks' )}
				onDeselect={() => setFormOption({ autoresponder: undefined })}
			>
				{Boolean( window.otterPro.isActive ) ? (
					<>
						<TextControl
							label={__( 'Autoresponder Subject', 'otter-blocks' )}
							placeholder={__(
								'Confirmation of your subscription',
								'otter-blocks'
							)}
							value={formOptions.autoresponder?.subject}
							onChange={( subject ) =>
								setFormOption({
									autoresponder: {
										...formOptions.autoresponder,
										subject
									}
								})
							}
							help={__(
								'Enter the subject of the autoresponder email.',
								'otter-blocks'
							)}
						/>

						<AutoresponderBody
							formOptions={formOptions}
							setFormOption={setFormOption}
						/>

						{
							config?.showAutoResponderNotice && (
								<Notice isDismissible={false} status={'info'}>
									{
										__( 'In order for Autoresponder to work, you need to have at least one Email field in Form.', 'otter-blocks' )
									}
								</Notice>
							)
						}

					</>
				) : (
					<div>
						<OtterNotice
							notice={__(
								'You need to activate Otter Pro.',
								'otter-blocks'
							)}
							instructions={__(
								'You need to activate your Otter Pro license to use Pro features of Form Block.',
								'otter-blocks'
							)}
						/>
					</div>
				)}
			</ToolsPanelItem>
		</>
	);
};

addFilter( 'otter.formBlock.options', 'themeisle-gutenberg/form-block-options', FormOptions );

// +-------------- Form File Inspector --------------+

const fileTypeSuggestions = [
	'image/*',
	'audio/*',
	'video/*',
	'image/jpeg',
	'.jpeg',
	'.png',
	'.gif',
	'.pdf',
	'.doc',
	'.docx',
	'.xls',
	'.xlsx',
	'.ppt',
	'.pptx',
	'.odt',
	'.ods',
	'.odp',
	'.odg',
	'.odc',
	'.odf',
	'.odb',
	'.csv',
	'.txt',
	'.zip',
	'.rar',
	'.7z',
	'.gz',
	'.psd',
	'.bmp',
	'.tif',
	'.tiff',
	'.svg',
	'.mp4',
	'.m4v',
	'.mov',
	'.wmv',
	'.avi',
	'.mpg',
	'.mp3',
	'.mkv'
];

const replaceJPGWithJPEG = fileType => {
	if ( 'image/jpg' === fileType || '.jpg' === fileType ) {
		return 'image/jpeg';
	}

	return fileType;
};

const FormFileInspector = ( Template, {
	attributes,
	setAttributes
}) => {

	if ( ! Boolean( window?.otterPro?.isActive ) ) {
		return (
			<Fragment>
				{ Template }
				<OtterNotice
					notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Sticky Extension.', 'otter-blocks' ) }
				/>
			</Fragment>
		);
	}

	return (
		<Fragment>
			<TextControl
				label={ __( 'Label', 'otter-blocks' ) }
				value={ attributes.label }
				onChange={ label => setAttributes({ label }) }
			/>

			<HideFieldLabelToggle attributes={ attributes } setAttributes={ setAttributes } />

			<FieldInputWidth attributes={ attributes } setAttributes={ setAttributes } />

			<TextControl
				label={ __( 'Max File Size in MB', 'otter-blocks' ) }
				type="number"
				value={ ! isNaN( parseInt( attributes.maxFileSize ) ) ? attributes.maxFileSize : undefined }
				onChange={ maxFileSize => {
					setSavedState( attributes.id, true );
					setAttributes({ maxFileSize: maxFileSize ? maxFileSize?.toString() : undefined });
				} }
				help={ __( 'You may need to contact your hosting provider to increase file sizes.', 'otter-blocks' ) }
			/>

			<FormTokenField
				label={ __( 'Allowed File Types', 'otter-blocks' ) }
				value={ attributes.allowedFileTypes }
				onChange={ allowedFileTypes => {
					setSavedState( attributes.id, true );
					setAttributes({ allowedFileTypes: allowedFileTypes ? allowedFileTypes.map( replaceJPGWithJPEG ) : undefined });
				} }
				help={ __( 'Add the allowed files types that can be loaded. E.g.: .png, .mp4, .jpeg, .zip, .pdf. Attention: The host provider might not allow to saving of all type of files.', 'otter-blocks' ) }
				suggestions={ fileTypeSuggestions }
			/>

			<TextControl
				label={ __( 'Help Text', 'otter-blocks' ) }
				value={ attributes.helpText }
				onChange={ helpText => setAttributes({ helpText }) }
			/>

			<ToggleControl
				label={ __( 'Required', 'otter-blocks' ) }
				help={ __( 'If enabled, the input field must be filled out before submitting the form.', 'otter-blocks' ) }
				checked={ attributes.isRequired }
				onChange={ isRequired => setAttributes({ isRequired }) }
			/>

			<ToggleControl
				label={ __( 'Allow multiple file uploads', 'otter-blocks' ) }
				checked={ Boolean( attributes.multipleFiles ) }
				onChange={ multipleFiles => {
					setSavedState( attributes.id, true );
					setAttributes({ multipleFiles: multipleFiles ? multipleFiles : undefined });
				} }
			/>

			{
				attributes.multipleFiles && (
					<TextControl
						label={ __( 'Maximum number of files', 'otter-blocks' ) }
						type="number"
						value={ ! isNaN( parseInt( attributes.maxFilesNumber ) ) ? ( attributes.maxFilesNumber ) : undefined }
						onChange={ maxFilesNumber => {
							setSavedState( attributes.id, true );
							setAttributes({ maxFilesNumber: maxFilesNumber ? maxFilesNumber?.toString() : undefined });
						} }
						help={ __( 'By default, only 10 files are allowed to load.', 'otter-blocks' )}
					/>
				)
			}

			<ToggleControl
				label={ __( 'Save to Media Library', 'otter-blocks' ) }
				help={ __( 'If enabled, the files will be saved to Media Library instead of adding them as attachments to email.', 'otter-blocks' ) }
				checked={ 'media-library' === attributes.saveFiles }
				onChange={ value => {
					setSavedState( attributes.id, true );
					setAttributes({ saveFiles: value ? 'media-library' : undefined });
				} }
			/>
		</Fragment>
	);
};

addFilter( 'otter.form.file.inspector', 'themeisle-gutenberg/form-file-inspector', FormFileInspector );
