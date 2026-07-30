import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

/**
 * Content for Event documents
 */
interface EventDocumentData {
	/**
	 * Title field in *Event*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * Starts field in *Event*
	 *
	 * - **Field Type**: Timestamp
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event.starts_at
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/timestamp
	 */
	starts_at: prismic.TimestampField;
	
	/**
	 * Ends field in *Event*
	 *
	 * - **Field Type**: Timestamp
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event.ends_at
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/timestamp
	 */
	ends_at: prismic.TimestampField;
	
	/**
	 * Location field in *Event*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event.location
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	location: prismic.KeyTextField;
	
	/**
	 * Description field in *Event*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event.body
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Image field in *Event*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event.image
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Hide after field in *Event*
	 *
	 * - **Field Type**: Timestamp
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event.expires_at
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/timestamp
	 */
	expires_at: prismic.TimestampField;
	
	/**
	 * Button label field in *Event*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event.cta_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cta_label: prismic.KeyTextField;
	
	/**
	 * Button link field in *Event*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event.cta_link
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Event document from Prismic
 *
 * - **API ID**: `event`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type EventDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<EventDocumentData>, "event", Lang>;

type PageDocumentDataSlicesSlice = PageHeaderSlice | FeatureSlice | ContentGridSlice | TeamGridSlice | BeliefsListSlice | RichTextSlice | CallToActionSlice | EventListSlice | InfoListSlice | MapEmbedSlice | ImagePosterSlice | ContactFormSlice

/**
 * Content for Page documents
 */
interface PageDocumentData {
	/**
	 * Slice Zone field in *Page*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<PageDocumentDataSlicesSlice>;/**
	 * Meta Title field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: page.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: page.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Page*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Page document from Prismic
 *
 * - **API ID**: `page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PageDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<PageDocumentData>, "page", Lang>;

/**
 * Item in *Settings → Navigation*
 */
export interface SettingsDocumentDataNavItem {
	/**
	 * Label field in *Settings → Navigation*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.nav[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * Link field in *Settings → Navigation*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.nav[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Item in *Settings → Footer links*
 */
export interface SettingsDocumentDataFooterLinksItem {
	/**
	 * Section heading field in *Settings → Footer links*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.footer_links[].section
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	section: prismic.KeyTextField;
	
	/**
	 * Label field in *Settings → Footer links*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.footer_links[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * Link field in *Settings → Footer links*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.footer_links[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Icon field in *Settings → Footer links*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: none
	 * - **API ID Path**: settings.footer_links[].icon
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	icon: prismic.SelectField<"none" | "instagram" | "facebook" | "mail", "filled">;
}

/**
 * Content for Settings documents
 */
interface SettingsDocumentData {
	/**
	 * Site name field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.site_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	site_name: prismic.KeyTextField;
	
	/**
	 * Contact email field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.contact_email
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_email: prismic.KeyTextField;
	
	/**
	 * Navigation field in *Settings*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.nav[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	nav: prismic.GroupField<Simplify<SettingsDocumentDataNavItem>>;
	
	/**
	 * Nav button label field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.nav_cta_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	nav_cta_label: prismic.KeyTextField;
	
	/**
	 * Nav button link field in *Settings*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.nav_cta_link
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	nav_cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Footer links field in *Settings*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.footer_links[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	footer_links: prismic.GroupField<Simplify<SettingsDocumentDataFooterLinksItem>>;
	
	/**
	 * Notice field in *Settings*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.notice_text
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	notice_text: prismic.RichTextField;
	
	/**
	 * Notice shows from field in *Settings*
	 *
	 * - **Field Type**: Date
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.notice_starts_at
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/date
	 */
	notice_starts_at: prismic.DateField;
	
	/**
	 * Notice shows until field in *Settings*
	 *
	 * - **Field Type**: Date
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.notice_ends_at
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/date
	 */
	notice_ends_at: prismic.DateField;
	
	/**
	 * Meeting time field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.meeting_when
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meeting_when: prismic.KeyTextField;
	
	/**
	 * Venue field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.meeting_venue
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meeting_venue: prismic.KeyTextField;
	
	/**
	 * Address field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.meeting_address
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meeting_address: prismic.KeyTextField;
	
	/**
	 * Directions link field in *Settings*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.meeting_directions
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	meeting_directions: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Default meta title field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.meta_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Default meta description field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.meta_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Default share image field in *Settings*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.og_image
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	og_image: prismic.ImageField<never>;
}

/**
 * Settings document from Prismic
 *
 * - **API ID**: `settings`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SettingsDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<SettingsDocumentData>, "settings", Lang>;

/**
 * Content for Team member documents
 */
interface TeamMemberDocumentData {
	/**
	 * Name field in *Team member*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: team_member.name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * Role field in *Team member*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: team_member.role
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	role: prismic.KeyTextField;
	
	/**
	 * Bio field in *Team member*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: team_member.bio
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	bio: prismic.RichTextField;
	
	/**
	 * Photo field in *Team member*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: team_member.photo
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	photo: prismic.ImageField<never>;
	
	/**
	 * Sort order field in *Team member*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: *None*
	 * - **API ID Path**: team_member.sort_order
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	sort_order: prismic.NumberField;
}

/**
 * Team member document from Prismic
 *
 * - **API ID**: `team_member`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type TeamMemberDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<TeamMemberDocumentData>, "team_member", Lang>;

export type AllDocumentTypes = EventDocument | PageDocument | SettingsDocument | TeamMemberDocument;

/**
 * Item in *Beliefs list → Default → Primary → Statements*
 */
export interface BeliefsListSliceDefaultPrimaryStatementsItem {
	/**
	 * Statement field in *Beliefs list → Default → Primary → Statements*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: beliefs_list.default.primary.statements[].statement
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	statement: prismic.RichTextField;
}

/**
 * Primary content in *Beliefs list → Default → Primary*
 */
export interface BeliefsListSliceDefaultPrimary {
	/**
	 * Title field in *Beliefs list → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: beliefs_list.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Intro field in *Beliefs list → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: beliefs_list.default.primary.intro
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	intro: prismic.RichTextField;
	
	/**
	 * Statements field in *Beliefs list → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: beliefs_list.default.primary.statements[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	statements: prismic.GroupField<Simplify<BeliefsListSliceDefaultPrimaryStatementsItem>>;
}

/**
 * Default variation for Beliefs list Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type BeliefsListSliceDefault = prismic.SharedSliceVariation<"default", Simplify<BeliefsListSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Beliefs list*
 */
type BeliefsListSliceVariation = BeliefsListSliceDefault

/**
 * Beliefs list Shared Slice
 *
 * - **API ID**: `beliefs_list`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type BeliefsListSlice = prismic.SharedSlice<"beliefs_list", BeliefsListSliceVariation>;

/**
 * Item in *Call to action → Default → Primary → Buttons*
 */
export interface CallToActionSliceDefaultPrimaryButtonsItem {
	/**
	 * Label field in *Call to action → Default → Primary → Buttons*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: call_to_action.default.primary.buttons[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * Link field in *Call to action → Default → Primary → Buttons*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: call_to_action.default.primary.buttons[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Primary content in *Call to action → Default → Primary*
 */
export interface CallToActionSliceDefaultPrimary {
	/**
	 * Title field in *Call to action → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: call_to_action.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Body field in *Call to action → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: call_to_action.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Buttons field in *Call to action → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: call_to_action.default.primary.buttons[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	buttons: prismic.GroupField<Simplify<CallToActionSliceDefaultPrimaryButtonsItem>>;
	
	/**
	 * Tone field in *Call to action → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: sunken
	 * - **API ID Path**: call_to_action.default.primary.tone
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	tone: prismic.SelectField<"default" | "sunken" | "inverse", "filled">;
}

/**
 * Default variation for Call to action Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CallToActionSliceDefault = prismic.SharedSliceVariation<"default", Simplify<CallToActionSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Call to action*
 */
type CallToActionSliceVariation = CallToActionSliceDefault

/**
 * Call to action Shared Slice
 *
 * - **API ID**: `call_to_action`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CallToActionSlice = prismic.SharedSlice<"call_to_action", CallToActionSliceVariation>;

/**
 * Primary content in *Contact form → Default → Primary*
 */
export interface ContactFormSliceDefaultPrimary {
	/**
	 * Title field in *Contact form → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: contact_form.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Intro field in *Contact form → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: contact_form.default.primary.intro
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	intro: prismic.RichTextField;
	
	/**
	 * Form field in *Contact form → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: contact
	 * - **API ID Path**: contact_form.default.primary.form
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	form: prismic.SelectField<"contact" | "donate", "filled">;
}

/**
 * Default variation for Contact form Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ContactFormSliceDefault = prismic.SharedSliceVariation<"default", Simplify<ContactFormSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Contact form*
 */
type ContactFormSliceVariation = ContactFormSliceDefault

/**
 * Contact form Shared Slice
 *
 * - **API ID**: `contact_form`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ContactFormSlice = prismic.SharedSlice<"contact_form", ContactFormSliceVariation>;

/**
 * Item in *Content grid → Default → Primary → Cells*
 */
export interface ContentGridSliceDefaultPrimaryCellsItem {
	/**
	 * Title field in *Content grid → Default → Primary → Cells*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_grid.default.primary.cells[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * Subtitle field in *Content grid → Default → Primary → Cells*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_grid.default.primary.cells[].subtitle
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	subtitle: prismic.KeyTextField;
	
	/**
	 * Body field in *Content grid → Default → Primary → Cells*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_grid.default.primary.cells[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
}

/**
 * Primary content in *Content grid → Default → Primary*
 */
export interface ContentGridSliceDefaultPrimary {
	/**
	 * Title field in *Content grid → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_grid.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Intro field in *Content grid → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_grid.default.primary.intro
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	intro: prismic.RichTextField;
	
	/**
	 * Cells field in *Content grid → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_grid.default.primary.cells[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	cells: prismic.GroupField<Simplify<ContentGridSliceDefaultPrimaryCellsItem>>;
}

/**
 * Default variation for Content grid Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ContentGridSliceDefault = prismic.SharedSliceVariation<"default", Simplify<ContentGridSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Content grid*
 */
type ContentGridSliceVariation = ContentGridSliceDefault

/**
 * Content grid Shared Slice
 *
 * - **API ID**: `content_grid`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ContentGridSlice = prismic.SharedSlice<"content_grid", ContentGridSliceVariation>;

/**
 * Item in *Event list → Default → Primary → Events*
 */
export interface EventListSliceDefaultPrimaryEventsItem {
	/**
	 * Event field in *Event list → Default → Primary → Events*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event_list.default.primary.events[].event
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	event: ContentRelationshipFieldWithData<[{"id":"event","fields":["title","starts_at","ends_at","location","body","image","expires_at"]}]>;
}

/**
 * Primary content in *Event list → Default → Primary*
 */
export interface EventListSliceDefaultPrimary {
	/**
	 * Title field in *Event list → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event_list.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Events field in *Event list → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: event_list.default.primary.events[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	events: prismic.GroupField<Simplify<EventListSliceDefaultPrimaryEventsItem>>;
}

/**
 * Default variation for Event list Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type EventListSliceDefault = prismic.SharedSliceVariation<"default", Simplify<EventListSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Event list*
 */
type EventListSliceVariation = EventListSliceDefault

/**
 * Event list Shared Slice
 *
 * - **API ID**: `event_list`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type EventListSlice = prismic.SharedSlice<"event_list", EventListSliceVariation>;

/**
 * Item in *Feature → Default → Primary → Images*
 */
export interface FeatureSliceDefaultPrimaryImagesItem {
	/**
	 * Image field in *Feature → Default → Primary → Images*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature.default.primary.images[].image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
}

/**
 * Item in *Feature → Default → Primary → Buttons*
 */
export interface FeatureSliceDefaultPrimaryButtonsItem {
	/**
	 * Label field in *Feature → Default → Primary → Buttons*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature.default.primary.buttons[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * Link field in *Feature → Default → Primary → Buttons*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature.default.primary.buttons[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Primary content in *Feature → Default → Primary*
 */
export interface FeatureSliceDefaultPrimary {
	/**
	 * Title field in *Feature → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Body field in *Feature → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Images field in *Feature → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature.default.primary.images[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	images: prismic.GroupField<Simplify<FeatureSliceDefaultPrimaryImagesItem>>;
	
	/**
	 * Buttons field in *Feature → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature.default.primary.buttons[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	buttons: prismic.GroupField<Simplify<FeatureSliceDefaultPrimaryButtonsItem>>;
	
	/**
	 * Image position field in *Feature → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: left
	 * - **API ID Path**: feature.default.primary.image_position
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	image_position: prismic.SelectField<"left" | "right", "filled">;
	
	/**
	 * Image can be enlarged field in *Feature → Default → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature.default.primary.image_enlargeable
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	image_enlargeable: prismic.BooleanField;
}

/**
 * Default variation for Feature Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeatureSliceDefault = prismic.SharedSliceVariation<"default", Simplify<FeatureSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Feature*
 */
type FeatureSliceVariation = FeatureSliceDefault

/**
 * Feature Shared Slice
 *
 * - **API ID**: `feature`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeatureSlice = prismic.SharedSlice<"feature", FeatureSliceVariation>;

/**
 * Primary content in *Image poster → Default → Primary*
 */
export interface ImagePosterSliceDefaultPrimary {
	/**
	 * Image field in *Image poster → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_poster.default.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Caption field in *Image poster → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_poster.default.primary.caption
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	caption: prismic.RichTextField;
	
	/**
	 * Link field in *Image poster → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_poster.default.primary.link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Default variation for Image poster Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ImagePosterSliceDefault = prismic.SharedSliceVariation<"default", Simplify<ImagePosterSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Image poster*
 */
type ImagePosterSliceVariation = ImagePosterSliceDefault

/**
 * Image poster Shared Slice
 *
 * - **API ID**: `image_poster`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ImagePosterSlice = prismic.SharedSlice<"image_poster", ImagePosterSliceVariation>;

/**
 * Item in *Info list → Default → Primary → Rows*
 */
export interface InfoListSliceDefaultPrimaryRowsItem {
	/**
	 * Label field in *Info list → Default → Primary → Rows*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: info_list.default.primary.rows[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * Value field in *Info list → Default → Primary → Rows*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: info_list.default.primary.rows[].value
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	value: prismic.RichTextField;
}

/**
 * Primary content in *Info list → Default → Primary*
 */
export interface InfoListSliceDefaultPrimary {
	/**
	 * Title field in *Info list → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: info_list.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Rows field in *Info list → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: info_list.default.primary.rows[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	rows: prismic.GroupField<Simplify<InfoListSliceDefaultPrimaryRowsItem>>;
}

/**
 * Default variation for Info list Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type InfoListSliceDefault = prismic.SharedSliceVariation<"default", Simplify<InfoListSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Info list*
 */
type InfoListSliceVariation = InfoListSliceDefault

/**
 * Info list Shared Slice
 *
 * - **API ID**: `info_list`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type InfoListSlice = prismic.SharedSlice<"info_list", InfoListSliceVariation>;

/**
 * Primary content in *Map embed → Default → Primary*
 */
export interface MapEmbedSliceDefaultPrimary {
	/**
	 * Title field in *Map embed → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: map_embed.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Address field in *Map embed → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: map_embed.default.primary.address
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	address: prismic.KeyTextField;
	
	/**
	 * Google Maps embed URL field in *Map embed → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: map_embed.default.primary.embed_url
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	embed_url: prismic.KeyTextField;
	
	/**
	 * Directions link field in *Map embed → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: map_embed.default.primary.directions_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	directions_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Default variation for Map embed Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type MapEmbedSliceDefault = prismic.SharedSliceVariation<"default", Simplify<MapEmbedSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Map embed*
 */
type MapEmbedSliceVariation = MapEmbedSliceDefault

/**
 * Map embed Shared Slice
 *
 * - **API ID**: `map_embed`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type MapEmbedSlice = prismic.SharedSlice<"map_embed", MapEmbedSliceVariation>;

/**
 * Primary content in *Page header → Default → Primary*
 */
export interface PageHeaderSliceDefaultPrimary {
	/**
	 * Title field in *Page header → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page_header.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Intro field in *Page header → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page_header.default.primary.intro
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	intro: prismic.RichTextField;
}

/**
 * Default variation for Page header Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PageHeaderSliceDefault = prismic.SharedSliceVariation<"default", Simplify<PageHeaderSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Page header*
 */
type PageHeaderSliceVariation = PageHeaderSliceDefault

/**
 * Page header Shared Slice
 *
 * - **API ID**: `page_header`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PageHeaderSlice = prismic.SharedSlice<"page_header", PageHeaderSliceVariation>;

/**
 * Primary content in *Rich text → Default → Primary*
 */
export interface RichTextSliceDefaultPrimary {
	/**
	 * Content field in *Rich text → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: rich_text.default.primary.content
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	content: prismic.RichTextField;
}

/**
 * Default variation for Rich text Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSliceDefault = prismic.SharedSliceVariation<"default", Simplify<RichTextSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Rich text*
 */
type RichTextSliceVariation = RichTextSliceDefault

/**
 * Rich text Shared Slice
 *
 * - **API ID**: `rich_text`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSlice = prismic.SharedSlice<"rich_text", RichTextSliceVariation>;

/**
 * Item in *Team grid → Default → Primary → Members*
 */
export interface TeamGridSliceDefaultPrimaryMembersItem {
	/**
	 * Team member field in *Team grid → Default → Primary → Members*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: team_grid.default.primary.members[].member
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	member: ContentRelationshipFieldWithData<[{"id":"team_member","fields":["name","role","bio","photo"]}]>;
}

/**
 * Primary content in *Team grid → Default → Primary*
 */
export interface TeamGridSliceDefaultPrimary {
	/**
	 * Title field in *Team grid → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: team_grid.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Intro field in *Team grid → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: team_grid.default.primary.intro
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	intro: prismic.RichTextField;
	
	/**
	 * Members field in *Team grid → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: team_grid.default.primary.members[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	members: prismic.GroupField<Simplify<TeamGridSliceDefaultPrimaryMembersItem>>;
}

/**
 * Default variation for Team grid Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TeamGridSliceDefault = prismic.SharedSliceVariation<"default", Simplify<TeamGridSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Team grid*
 */
type TeamGridSliceVariation = TeamGridSliceDefault

/**
 * Team grid Shared Slice
 *
 * - **API ID**: `team_grid`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TeamGridSlice = prismic.SharedSlice<"team_grid", TeamGridSliceVariation>;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			EventDocument,
			EventDocumentData,
			PageDocument,
			PageDocumentData,
			PageDocumentDataSlicesSlice,
			SettingsDocument,
			SettingsDocumentData,
			SettingsDocumentDataNavItem,
			SettingsDocumentDataFooterLinksItem,
			TeamMemberDocument,
			TeamMemberDocumentData,
			AllDocumentTypes,
			BeliefsListSlice,
			BeliefsListSliceDefaultPrimaryStatementsItem,
			BeliefsListSliceDefaultPrimary,
			BeliefsListSliceVariation,
			BeliefsListSliceDefault,
			CallToActionSlice,
			CallToActionSliceDefaultPrimaryButtonsItem,
			CallToActionSliceDefaultPrimary,
			CallToActionSliceVariation,
			CallToActionSliceDefault,
			ContactFormSlice,
			ContactFormSliceDefaultPrimary,
			ContactFormSliceVariation,
			ContactFormSliceDefault,
			ContentGridSlice,
			ContentGridSliceDefaultPrimaryCellsItem,
			ContentGridSliceDefaultPrimary,
			ContentGridSliceVariation,
			ContentGridSliceDefault,
			EventListSlice,
			EventListSliceDefaultPrimaryEventsItem,
			EventListSliceDefaultPrimary,
			EventListSliceVariation,
			EventListSliceDefault,
			FeatureSlice,
			FeatureSliceDefaultPrimaryImagesItem,
			FeatureSliceDefaultPrimaryButtonsItem,
			FeatureSliceDefaultPrimary,
			FeatureSliceVariation,
			FeatureSliceDefault,
			ImagePosterSlice,
			ImagePosterSliceDefaultPrimary,
			ImagePosterSliceVariation,
			ImagePosterSliceDefault,
			InfoListSlice,
			InfoListSliceDefaultPrimaryRowsItem,
			InfoListSliceDefaultPrimary,
			InfoListSliceVariation,
			InfoListSliceDefault,
			MapEmbedSlice,
			MapEmbedSliceDefaultPrimary,
			MapEmbedSliceVariation,
			MapEmbedSliceDefault,
			PageHeaderSlice,
			PageHeaderSliceDefaultPrimary,
			PageHeaderSliceVariation,
			PageHeaderSliceDefault,
			RichTextSlice,
			RichTextSliceDefaultPrimary,
			RichTextSliceVariation,
			RichTextSliceDefault,
			TeamGridSlice,
			TeamGridSliceDefaultPrimaryMembersItem,
			TeamGridSliceDefaultPrimary,
			TeamGridSliceVariation,
			TeamGridSliceDefault
		}
	}
}