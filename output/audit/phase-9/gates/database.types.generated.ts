
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "appointment_items": {
                  Row: {
                    "appointment_id": string,"branch_id": string,"buffer_after_minutes": number,"buffer_before_minutes": number,"busy_range": unknown,"created_at": string,"created_by": string | null,"duration_minutes": number,"effective_end": string,"effective_start": string,"id": string,"price_minor": number,"service_id": string,"service_name_ar": string | null,"service_name_en": string | null,"sort_order": number,"staff_id": string | null,"status_active": boolean,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "appointment_id": string,"branch_id": string,"buffer_after_minutes"?: number,"buffer_before_minutes"?: number,"busy_range"?: unknown,"created_at"?: string,"created_by"?: string | null,"duration_minutes": number,"effective_end": string,"effective_start": string,"id"?: string,"price_minor": number,"service_id": string,"service_name_ar"?: string | null,"service_name_en"?: string | null,"sort_order"?: number,"staff_id"?: string | null,"status_active"?: boolean,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "appointment_id"?: string,"branch_id"?: string,"buffer_after_minutes"?: number,"buffer_before_minutes"?: number,"busy_range"?: unknown,"created_at"?: string,"created_by"?: string | null,"duration_minutes"?: number,"effective_end"?: string,"effective_start"?: string,"id"?: string,"price_minor"?: number,"service_id"?: string,"service_name_ar"?: string | null,"service_name_en"?: string | null,"sort_order"?: number,"staff_id"?: string | null,"status_active"?: boolean,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "appointment_items_appointment_branch_fk"
      columns: ["appointment_id","branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id","branch_id","tenant_id"]
    },{
      foreignKeyName: "appointment_items_appointment_id_tenant_id_fkey"
      columns: ["appointment_id","tenant_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "appointment_items_branch_fk"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "appointment_items_service_fk"
      columns: ["service_id","tenant_id"]
isOneToOne: false
      referencedRelation: "service_effective_values"
      referencedColumns: ["service_id","tenant_id"]
    },{
      foreignKeyName: "appointment_items_service_fk"
      columns: ["service_id","tenant_id"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "appointment_items_staff_id_tenant_id_fkey"
      columns: ["staff_id","tenant_id"]
isOneToOne: false
      referencedRelation: "staff_members"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "appointment_items_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"appointment_manage_tokens": {
                  Row: {
                    "appointment_id": string,"branch_id": string,"created_at": string,"expires_at": string,"id": string,"tenant_id": string,"token_hash": string
                  }
                  Insert: {
                    "appointment_id": string,"branch_id": string,"created_at"?: string,"expires_at": string,"id"?: string,"tenant_id": string,"token_hash": string
                  }
                  Update: {
                    "appointment_id"?: string,"branch_id"?: string,"created_at"?: string,"expires_at"?: string,"id"?: string,"tenant_id"?: string,"token_hash"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "appointment_manage_tokens_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "appointment_manage_tokens_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"appointments": {
                  Row: {
                    "booked_via": string,"branch_id": string,"cancellation_note": string | null,"cancellation_reason_id": string | null,"cancelled_at": string | null,"cancelled_by": string | null,"client_id": string | null,"created_at": string,"created_by": string | null,"id": string,"notes": string | null,"online_source": string | null,"ref_number": string,"scheduled_end": string,"scheduled_start": string,"status": string,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "booked_via"?: string,"branch_id": string,"cancellation_note"?: string | null,"cancellation_reason_id"?: string | null,"cancelled_at"?: string | null,"cancelled_by"?: string | null,"client_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"notes"?: string | null,"online_source"?: string | null,"ref_number": string,"scheduled_end": string,"scheduled_start": string,"status"?: string,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "booked_via"?: string,"branch_id"?: string,"cancellation_note"?: string | null,"cancellation_reason_id"?: string | null,"cancelled_at"?: string | null,"cancelled_by"?: string | null,"client_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"notes"?: string | null,"online_source"?: string | null,"ref_number"?: string,"scheduled_end"?: string,"scheduled_start"?: string,"status"?: string,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "appointments_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "appointments_cancellation_reason_fk"
      columns: ["cancellation_reason_id","tenant_id"]
isOneToOne: false
      referencedRelation: "cancellation_reasons"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "appointments_client_fk"
      columns: ["client_id","tenant_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "appointments_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"branch_id": string | null,"changed_fields": NonNullable<Json>,"created_at": string,"entity_id": string | null,"entity_type": string,"id": number,"tenant_id": string
                  }
                  Insert: {
                    "action": string,"actor_id"?: string | null,"branch_id"?: string | null,"changed_fields"?: NonNullable<Json>,"created_at"?: string,"entity_id"?: string | null,"entity_type": string,"id"?: never,"tenant_id": string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"branch_id"?: string | null,"changed_fields"?: NonNullable<Json>,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string,"id"?: never,"tenant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "audit_log_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"availability_pending": {
                  Row: {
                    "txid": number
                  }
                  Insert: {
                    "txid"?: number
                  }
                  Update: {
                    "txid"?: number
                  }
                  Relationships: [
                    
                  ]
                },"blocked_time_types": {
                  Row: {
                    "color": string,"created_at": string,"id": string,"is_active": boolean,"name_ar": string | null,"name_en": string | null,"sort_order": number,"tenant_id": string,"updated_at": string
                  }
                  Insert: {
                    "color"?: string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en"?: string | null,"sort_order"?: number,"tenant_id": string,"updated_at"?: string
                  }
                  Update: {
                    "color"?: string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en"?: string | null,"sort_order"?: number,"tenant_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "blocked_time_types_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"blocked_times": {
                  Row: {
                    "all_branches": boolean,"blocked_range": unknown,"blocked_time_type_id": string,"branch_id": string | null,"created_at": string,"created_by": string | null,"ends_at": string,"id": string,"notes": string | null,"staff_id": string,"starts_at": string,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "all_branches"?: boolean,"blocked_range"?: never,"blocked_time_type_id": string,"branch_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"ends_at": string,"id"?: string,"notes"?: string | null,"staff_id": string,"starts_at": string,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "all_branches"?: boolean,"blocked_range"?: never,"blocked_time_type_id"?: string,"branch_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"ends_at"?: string,"id"?: string,"notes"?: string | null,"staff_id"?: string,"starts_at"?: string,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "blocked_times_blocked_time_type_id_tenant_id_fkey"
      columns: ["blocked_time_type_id","tenant_id"]
isOneToOne: false
      referencedRelation: "blocked_time_types"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "blocked_times_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "blocked_times_staff_id_tenant_id_fkey"
      columns: ["staff_id","tenant_id"]
isOneToOne: false
      referencedRelation: "staff_members"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "blocked_times_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"booking_overrides": {
                  Row: {
                    "action": string,"appointment_id": string,"appointment_item_id": string | null,"branch_id": string,"created_at": string,"created_by": string,"details": NonNullable<Json>,"id": string,"reason": string | null,"rule": string,"tenant_id": string,"updated_at": string
                  }
                  Insert: {
                    "action": string,"appointment_id": string,"appointment_item_id"?: string | null,"branch_id": string,"created_at"?: string,"created_by": string,"details"?: NonNullable<Json>,"id"?: string,"reason"?: string | null,"rule": string,"tenant_id": string,"updated_at"?: string
                  }
                  Update: {
                    "action"?: string,"appointment_id"?: string,"appointment_item_id"?: string | null,"branch_id"?: string,"created_at"?: string,"created_by"?: string,"details"?: NonNullable<Json>,"id"?: string,"reason"?: string | null,"rule"?: string,"tenant_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "booking_overrides_appointment_id_tenant_id_fkey"
      columns: ["appointment_id","tenant_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "booking_overrides_appointment_item_id_tenant_id_fkey"
      columns: ["appointment_item_id","tenant_id"]
isOneToOne: false
      referencedRelation: "appointment_items"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "booking_overrides_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "booking_overrides_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"branch_availability_versions": {
                  Row: {
                    "branch_id": string,"changed_at": string,"version": number
                  }
                  Insert: {
                    "branch_id": string,"changed_at"?: string,"version"?: number
                  }
                  Update: {
                    "branch_id"?: string,"changed_at"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "branch_availability_versions_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: true
      referencedRelation: "branches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "branch_availability_versions_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: true
      referencedRelation: "service_effective_values"
      referencedColumns: ["branch_id"]
    }
                  ]
                },"branch_opening_hours": {
                  Row: {
                    "branch_id": string,"closes_at": string,"created_at": string,"day_of_week": number,"id": string,"is_closed": boolean,"opens_at": string,"seq": number,"tenant_id": string,"updated_at": string
                  }
                  Insert: {
                    "branch_id": string,"closes_at": string,"created_at"?: string,"day_of_week": number,"id"?: string,"is_closed"?: boolean,"opens_at": string,"seq"?: number,"tenant_id": string,"updated_at"?: string
                  }
                  Update: {
                    "branch_id"?: string,"closes_at"?: string,"created_at"?: string,"day_of_week"?: number,"id"?: string,"is_closed"?: boolean,"opens_at"?: string,"seq"?: number,"tenant_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "branch_opening_hours_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    }
                  ]
                },"branches": {
                  Row: {
                    "address": string | null,"created_at": string,"enabled_payment_methods": (string)[],"first_day_of_week": number,"id": string,"invoice_prefix": string,"is_active": boolean,"name_ar": string | null,"name_en": string,"phone": string | null,"receipt_footer_ar": string | null,"receipt_footer_en": string | null,"receipt_header_ar": string | null,"receipt_header_en": string | null,"register_required": boolean,"slot_step_minutes": number,"tenant_id": string,"time_format": number,"timezone": string,"tip_presets_percent": (number)[],"tips_enabled": boolean,"updated_at": string
                  }
                  Insert: {
                    "address"?: string | null,"created_at"?: string,"enabled_payment_methods"?: (string)[],"first_day_of_week"?: number,"id"?: string,"invoice_prefix"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en": string,"phone"?: string | null,"receipt_footer_ar"?: string | null,"receipt_footer_en"?: string | null,"receipt_header_ar"?: string | null,"receipt_header_en"?: string | null,"register_required"?: boolean,"slot_step_minutes"?: number,"tenant_id": string,"time_format"?: number,"timezone"?: string,"tip_presets_percent"?: (number)[],"tips_enabled"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "address"?: string | null,"created_at"?: string,"enabled_payment_methods"?: (string)[],"first_day_of_week"?: number,"id"?: string,"invoice_prefix"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en"?: string,"phone"?: string | null,"receipt_footer_ar"?: string | null,"receipt_footer_en"?: string | null,"receipt_header_ar"?: string | null,"receipt_header_en"?: string | null,"register_required"?: boolean,"slot_step_minutes"?: number,"tenant_id"?: string,"time_format"?: number,"timezone"?: string,"tip_presets_percent"?: (number)[],"tips_enabled"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "branches_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"cancellation_reasons": {
                  Row: {
                    "created_at": string,"id": string,"is_active": boolean,"name_ar": string | null,"name_en": string | null,"sort_order": number,"system_key": string | null,"tenant_id": string,"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en"?: string | null,"sort_order"?: number,"system_key"?: string | null,"tenant_id": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en"?: string | null,"sort_order"?: number,"system_key"?: string | null,"tenant_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "cancellation_reasons_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"client_consents": {
                  Row: {
                    "channel": string,"client_id": string,"id": string,"purpose": string,"recorded_at": string,"recorded_by": string | null,"source": string,"status": string,"tenant_id": string
                  }
                  Insert: {
                    "channel": string,"client_id": string,"id"?: string,"purpose": string,"recorded_at"?: string,"recorded_by"?: string | null,"source": string,"status": string,"tenant_id": string
                  }
                  Update: {
                    "channel"?: string,"client_id"?: string,"id"?: string,"purpose"?: string,"recorded_at"?: string,"recorded_by"?: string | null,"source"?: string,"status"?: string,"tenant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "client_consents_client_id_tenant_id_fkey"
      columns: ["client_id","tenant_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "client_consents_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"client_import_batches": {
                  Row: {
                    "batch_key": string,"chunk_count": number,"chunks_done": number,"completed_at": string | null,"created_at": string,"created_by": string | null,"duplicate_policy": string,"failed_count": number,"file_name": string | null,"id": string,"imported_count": number,"invalid_count": number,"marked_count": number,"skipped_count": number,"status": string,"tenant_id": string,"total_rows": number,"updated_at": string,"updated_by": string | null,"client_import_batch_summary": Json | null
                  }
                  Insert: {
                    "batch_key": string,"chunk_count"?: number,"chunks_done"?: number,"completed_at"?: string | null,"created_at"?: string,"created_by"?: string | null,"duplicate_policy": string,"failed_count"?: number,"file_name"?: string | null,"id"?: string,"imported_count"?: number,"invalid_count"?: number,"marked_count"?: number,"skipped_count"?: number,"status"?: string,"tenant_id": string,"total_rows": number,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "batch_key"?: string,"chunk_count"?: number,"chunks_done"?: number,"completed_at"?: string | null,"created_at"?: string,"created_by"?: string | null,"duplicate_policy"?: string,"failed_count"?: number,"file_name"?: string | null,"id"?: string,"imported_count"?: number,"invalid_count"?: number,"marked_count"?: number,"skipped_count"?: number,"status"?: string,"tenant_id"?: string,"total_rows"?: number,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "client_import_batches_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"client_import_rows": {
                  Row: {
                    "batch_id": string,"chunk": number | null,"client_id": string | null,"created_at": string,"created_by": string | null,"data": NonNullable<Json>,"duplicate_of": (string)[] | null,"errors": NonNullable<Json>,"id": string,"row_number": number,"status": string,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "batch_id": string,"chunk"?: number | null,"client_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"data"?: NonNullable<Json>,"duplicate_of"?: (string)[] | null,"errors"?: NonNullable<Json>,"id"?: string,"row_number": number,"status": string,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "batch_id"?: string,"chunk"?: number | null,"client_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"data"?: NonNullable<Json>,"duplicate_of"?: (string)[] | null,"errors"?: NonNullable<Json>,"id"?: string,"row_number"?: number,"status"?: string,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "client_import_rows_batch_id_tenant_id_fkey"
      columns: ["batch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "client_import_batches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "client_import_rows_client_id_tenant_id_fkey"
      columns: ["client_id","tenant_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "client_import_rows_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"client_notes": {
                  Row: {
                    "client_id": string,"content": string,"created_at": string,"created_by": string | null,"id": string,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "client_id": string,"content": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "client_id"?: string,"content"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "client_notes_client_id_tenant_id_fkey"
      columns: ["client_id","tenant_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "client_notes_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"clients": {
                  Row: {
                    "alerts": string | null,"allergies": string | null,"anonymized_at": string | null,"blocked_reason": string | null,"created_at": string,"created_by": string | null,"date_of_birth": string | null,"email": string | null,"first_name": string,"first_name_alt": string | null,"gender": string | null,"id": string,"import_batch_id": string | null,"import_row_number": number | null,"is_blocked": boolean,"is_deleted": boolean,"last_name": string | null,"last_name_alt": string | null,"merged_into": string | null,"phone": string | null,"preferred_language": string | null,"review_pending": boolean,"search_text": string | null,"source": string | null,"tags": NonNullable<Json>,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "alerts"?: string | null,"allergies"?: string | null,"anonymized_at"?: string | null,"blocked_reason"?: string | null,"created_at"?: string,"created_by"?: string | null,"date_of_birth"?: string | null,"email"?: string | null,"first_name": string,"first_name_alt"?: string | null,"gender"?: string | null,"id"?: string,"import_batch_id"?: string | null,"import_row_number"?: number | null,"is_blocked"?: boolean,"is_deleted"?: boolean,"last_name"?: string | null,"last_name_alt"?: string | null,"merged_into"?: string | null,"phone"?: string | null,"preferred_language"?: string | null,"review_pending"?: boolean,"search_text"?: never,"source"?: string | null,"tags"?: NonNullable<Json>,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "alerts"?: string | null,"allergies"?: string | null,"anonymized_at"?: string | null,"blocked_reason"?: string | null,"created_at"?: string,"created_by"?: string | null,"date_of_birth"?: string | null,"email"?: string | null,"first_name"?: string,"first_name_alt"?: string | null,"gender"?: string | null,"id"?: string,"import_batch_id"?: string | null,"import_row_number"?: number | null,"is_blocked"?: boolean,"is_deleted"?: boolean,"last_name"?: string | null,"last_name_alt"?: string | null,"merged_into"?: string | null,"phone"?: string | null,"preferred_language"?: string | null,"review_pending"?: boolean,"search_text"?: never,"source"?: string | null,"tags"?: NonNullable<Json>,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "clients_import_batch_fk"
      columns: ["import_batch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "client_import_batches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "clients_merged_into_tenant_id_fkey"
      columns: ["merged_into","tenant_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "clients_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"closed_periods": {
                  Row: {
                    "branch_id": string,"created_at": string,"ends_on": string,"id": string,"name_ar": string | null,"name_en": string | null,"starts_on": string,"tenant_id": string,"updated_at": string
                  }
                  Insert: {
                    "branch_id": string,"created_at"?: string,"ends_on": string,"id"?: string,"name_ar"?: string | null,"name_en"?: string | null,"starts_on": string,"tenant_id": string,"updated_at"?: string
                  }
                  Update: {
                    "branch_id"?: string,"created_at"?: string,"ends_on"?: string,"id"?: string,"name_ar"?: string | null,"name_en"?: string | null,"starts_on"?: string,"tenant_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "closed_periods_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    }
                  ]
                },"currencies": {
                  Row: {
                    "code": string,"is_active": boolean,"minor_exponent": number,"name_ar": string,"name_en": string,"symbol": string | null
                  }
                  Insert: {
                    "code": string,"is_active"?: boolean,"minor_exponent": number,"name_ar": string,"name_en": string,"symbol"?: string | null
                  }
                  Update: {
                    "code"?: string,"is_active"?: boolean,"minor_exponent"?: number,"name_ar"?: string,"name_en"?: string,"symbol"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"data_access_requests": {
                  Row: {
                    "branch_id": string,"client_id": string,"created_at": string,"decided_at": string | null,"decided_by": string | null,"decline_reason": string | null,"delivered_at": string | null,"export_job_id": string | null,"id": string,"link_expires_at": string | null,"locale": string,"requested_at": string,"status": string,"tenant_id": string,"updated_at": string,"verification_id": string
                  }
                  Insert: {
                    "branch_id": string,"client_id": string,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"decline_reason"?: string | null,"delivered_at"?: string | null,"export_job_id"?: string | null,"id"?: string,"link_expires_at"?: string | null,"locale": string,"requested_at"?: string,"status"?: string,"tenant_id": string,"updated_at"?: string,"verification_id": string
                  }
                  Update: {
                    "branch_id"?: string,"client_id"?: string,"created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"decline_reason"?: string | null,"delivered_at"?: string | null,"export_job_id"?: string | null,"id"?: string,"link_expires_at"?: string | null,"locale"?: string,"requested_at"?: string,"status"?: string,"tenant_id"?: string,"updated_at"?: string,"verification_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "data_access_requests_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "data_access_requests_client_id_tenant_id_fkey"
      columns: ["client_id","tenant_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "data_access_requests_export_job_id_fkey"
      columns: ["export_job_id"]
isOneToOne: false
      referencedRelation: "export_jobs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "data_access_requests_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"export_download_tokens": {
                  Row: {
                    "created_at": string,"created_by": string,"expires_at": string,"file_key": string,"job_id": string,"token_hash": string,"used_at": string | null,"volume": number
                  }
                  Insert: {
                    "created_at"?: string,"created_by": string,"expires_at": string,"file_key": string,"job_id": string,"token_hash": string,"used_at"?: string | null,"volume": number
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string,"expires_at"?: string,"file_key"?: string,"job_id"?: string,"token_hash"?: string,"used_at"?: string | null,"volume"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "export_download_tokens_job_id_fkey"
      columns: ["job_id"]
isOneToOne: false
      referencedRelation: "export_jobs"
      referencedColumns: ["id"]
    }
                  ]
                },"export_jobs": {
                  Row: {
                    "branch_ids": (string)[] | null,"completed_at": string | null,"created_at": string,"error": string | null,"expires_at": string | null,"files": NonNullable<Json>,"filters": NonNullable<Json>,"id": string,"kind": string,"requested_by": string,"row_count": number,"rows_per_file": number,"slice_rows": number,"snapshot_at": string,"status": string,"tenant_id": string,"updated_at": string,"export_job_summary": Json | null
                  }
                  Insert: {
                    "branch_ids"?: (string)[] | null,"completed_at"?: string | null,"created_at"?: string,"error"?: string | null,"expires_at"?: string | null,"files"?: NonNullable<Json>,"filters"?: NonNullable<Json>,"id"?: string,"kind": string,"requested_by": string,"row_count"?: number,"rows_per_file"?: number,"slice_rows"?: number,"snapshot_at"?: string,"status"?: string,"tenant_id": string,"updated_at"?: string
                  }
                  Update: {
                    "branch_ids"?: (string)[] | null,"completed_at"?: string | null,"created_at"?: string,"error"?: string | null,"expires_at"?: string | null,"files"?: NonNullable<Json>,"filters"?: NonNullable<Json>,"id"?: string,"kind"?: string,"requested_by"?: string,"row_count"?: number,"rows_per_file"?: number,"slice_rows"?: number,"snapshot_at"?: string,"status"?: string,"tenant_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "export_jobs_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"export_parts": {
                  Row: {
                    "content": string,"created_at": string,"file_key": string,"is_last": boolean,"job_id": string,"last_key": string | null,"part_no": number,"row_count": number
                  }
                  Insert: {
                    "content": string,"created_at"?: string,"file_key": string,"is_last": boolean,"job_id": string,"last_key"?: string | null,"part_no": number,"row_count": number
                  }
                  Update: {
                    "content"?: string,"created_at"?: string,"file_key"?: string,"is_last"?: boolean,"job_id"?: string,"last_key"?: string | null,"part_no"?: number,"row_count"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "export_parts_job_id_fkey"
      columns: ["job_id"]
isOneToOne: false
      referencedRelation: "export_jobs"
      referencedColumns: ["id"]
    }
                  ]
                },"idempotency_keys": {
                  Row: {
                    "created_at": string,"function_name": string,"id": string,"key": string,"request_hash": string,"response_body": Json | null,"response_status": number | null,"status": string,"tenant_id": string,"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"function_name": string,"id"?: string,"key": string,"request_hash": string,"response_body"?: Json | null,"response_status"?: number | null,"status"?: string,"tenant_id": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"function_name"?: string,"id"?: string,"key"?: string,"request_hash"?: string,"response_body"?: Json | null,"response_status"?: number | null,"status"?: string,"tenant_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "idempotency_keys_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"invoice_counters": {
                  Row: {
                    "branch_id": string,"created_at": string,"id": string,"kind": string,"next_number": number,"tenant_id": string,"updated_at": string
                  }
                  Insert: {
                    "branch_id": string,"created_at"?: string,"id"?: string,"kind": string,"next_number"?: number,"tenant_id": string,"updated_at"?: string
                  }
                  Update: {
                    "branch_id"?: string,"created_at"?: string,"id"?: string,"kind"?: string,"next_number"?: number,"tenant_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invoice_counters_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    }
                  ]
                },"memberships": {
                  Row: {
                    "all_branches": boolean,"branch_id": string | null,"created_at": string,"created_by": string | null,"id": string,"is_active": boolean,"role": string,"tenant_id": string,"updated_at": string,"updated_by": string | null,"user_id": string
                  }
                  Insert: {
                    "all_branches"?: boolean,"branch_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_active"?: boolean,"role": string,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null,"user_id": string
                  }
                  Update: {
                    "all_branches"?: boolean,"branch_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_active"?: boolean,"role"?: string,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "memberships_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "memberships_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"notification_attempts": {
                  Row: {
                    "attempt_no": number,"branch_id": string | null,"channel": string,"code": string | null,"delivery_error_code": string | null,"delivery_status": string | null,"delivery_updated_at": string | null,"duration_ms": number | null,"error_code": string | null,"finished_at": string | null,"id": string,"message_id": string,"outcome": string,"provider": string | null,"started_at": string,"tenant_id": string
                  }
                  Insert: {
                    "attempt_no": number,"branch_id"?: string | null,"channel": string,"code"?: string | null,"delivery_error_code"?: string | null,"delivery_status"?: string | null,"delivery_updated_at"?: string | null,"duration_ms"?: number | null,"error_code"?: string | null,"finished_at"?: string | null,"id"?: string,"message_id": string,"outcome"?: string,"provider"?: string | null,"started_at"?: string,"tenant_id": string
                  }
                  Update: {
                    "attempt_no"?: number,"branch_id"?: string | null,"channel"?: string,"code"?: string | null,"delivery_error_code"?: string | null,"delivery_status"?: string | null,"delivery_updated_at"?: string | null,"duration_ms"?: number | null,"error_code"?: string | null,"finished_at"?: string | null,"id"?: string,"message_id"?: string,"outcome"?: string,"provider"?: string | null,"started_at"?: string,"tenant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notification_attempts_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "notification_attempts_message_id_tenant_id_fkey"
      columns: ["message_id","tenant_id"]
isOneToOne: false
      referencedRelation: "notification_messages"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "notification_attempts_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"notification_messages": {
                  Row: {
                    "appointment_id": string | null,"appointment_start": string | null,"attempts": number,"branch_id": string | null,"channel": string,"client_id": string | null,"created_at": string,"dedupe_key": string,"destination_hash": string | null,"destination_masked": string | null,"id": string,"kind": string,"last_error_code": string | null,"locale": string,"next_attempt_at": string | null,"payload": NonNullable<Json>,"provider": string | null,"provider_message_id": string | null,"requested_by": string | null,"scheduled_for": string,"sent_at": string | null,"skip_reason": string | null,"status": string,"template_key": string,"template_version": number | null,"tenant_id": string,"updated_at": string
                  }
                  Insert: {
                    "appointment_id"?: string | null,"appointment_start"?: string | null,"attempts"?: number,"branch_id"?: string | null,"channel"?: string,"client_id"?: string | null,"created_at"?: string,"dedupe_key": string,"destination_hash"?: string | null,"destination_masked"?: string | null,"id"?: string,"kind": string,"last_error_code"?: string | null,"locale": string,"next_attempt_at"?: string | null,"payload"?: NonNullable<Json>,"provider"?: string | null,"provider_message_id"?: string | null,"requested_by"?: string | null,"scheduled_for"?: string,"sent_at"?: string | null,"skip_reason"?: string | null,"status"?: string,"template_key": string,"template_version"?: number | null,"tenant_id": string,"updated_at"?: string
                  }
                  Update: {
                    "appointment_id"?: string | null,"appointment_start"?: string | null,"attempts"?: number,"branch_id"?: string | null,"channel"?: string,"client_id"?: string | null,"created_at"?: string,"dedupe_key"?: string,"destination_hash"?: string | null,"destination_masked"?: string | null,"id"?: string,"kind"?: string,"last_error_code"?: string | null,"locale"?: string,"next_attempt_at"?: string | null,"payload"?: NonNullable<Json>,"provider"?: string | null,"provider_message_id"?: string | null,"requested_by"?: string | null,"scheduled_for"?: string,"sent_at"?: string | null,"skip_reason"?: string | null,"status"?: string,"template_key"?: string,"template_version"?: number | null,"tenant_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notification_messages_appointment_id_tenant_id_fkey"
      columns: ["appointment_id","tenant_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "notification_messages_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "notification_messages_client_id_tenant_id_fkey"
      columns: ["client_id","tenant_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "notification_messages_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"notification_settings": {
                  Row: {
                    "branch_id": string,"channels": (string)[],"confirm_desk_bookings": boolean,"created_at": string,"created_by": string | null,"id": string,"reminder_offsets_minutes": (number)[],"reminders_enabled": boolean,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "branch_id": string,"channels"?: (string)[],"confirm_desk_bookings"?: boolean,"created_at"?: string,"created_by"?: string | null,"id"?: string,"reminder_offsets_minutes"?: (number)[],"reminders_enabled"?: boolean,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "branch_id"?: string,"channels"?: (string)[],"confirm_desk_bookings"?: boolean,"created_at"?: string,"created_by"?: string | null,"id"?: string,"reminder_offsets_minutes"?: (number)[],"reminders_enabled"?: boolean,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "notification_settings_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "notification_settings_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"online_booking_daily": {
                  Row: {
                    "branch_id": string,"code_requests": number,"day": string,"source": string,"tenant_id": string,"visits": number
                  }
                  Insert: {
                    "branch_id": string,"code_requests"?: number,"day": string,"source": string,"tenant_id": string,"visits"?: number
                  }
                  Update: {
                    "branch_id"?: string,"code_requests"?: number,"day"?: string,"source"?: string,"tenant_id"?: string,"visits"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "online_booking_daily_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "online_booking_daily_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"online_booking_settings": {
                  Row: {
                    "branch_id": string,"cancel_cutoff_minutes": number,"created_at": string,"created_by": string | null,"id": string,"is_enabled": boolean,"min_notice_minutes": number,"show_staff": boolean,"slug": string | null,"tenant_id": string,"updated_at": string,"updated_by": string | null,"window_days": number
                  }
                  Insert: {
                    "branch_id": string,"cancel_cutoff_minutes"?: number,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_enabled"?: boolean,"min_notice_minutes"?: number,"show_staff"?: boolean,"slug"?: string | null,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null,"window_days"?: number
                  }
                  Update: {
                    "branch_id"?: string,"cancel_cutoff_minutes"?: number,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_enabled"?: boolean,"min_notice_minutes"?: number,"show_staff"?: boolean,"slug"?: string | null,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null,"window_days"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "online_booking_settings_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "online_booking_settings_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"online_slot_cache": {
                  Row: {
                    "branch_id": string,"cache_key": string,"computed_at": string,"slots": NonNullable<Json>,"version": number
                  }
                  Insert: {
                    "branch_id": string,"cache_key": string,"computed_at"?: string,"slots": NonNullable<Json>,"version": number
                  }
                  Update: {
                    "branch_id"?: string,"cache_key"?: string,"computed_at"?: string,"slots"?: NonNullable<Json>,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "online_slot_cache_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "online_slot_cache_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: false
      referencedRelation: "service_effective_values"
      referencedColumns: ["branch_id"]
    }
                  ]
                },"online_verifications": {
                  Row: {
                    "attempts": number,"branch_id": string,"code_hash": string,"consumed_at": string | null,"created_at": string,"destination_hash": string,"expires_at": string,"id": string,"purpose": string,"tenant_id": string,"verified_at": string | null
                  }
                  Insert: {
                    "attempts"?: number,"branch_id": string,"code_hash": string,"consumed_at"?: string | null,"created_at"?: string,"destination_hash": string,"expires_at": string,"id"?: string,"purpose": string,"tenant_id": string,"verified_at"?: string | null
                  }
                  Update: {
                    "attempts"?: number,"branch_id"?: string,"code_hash"?: string,"consumed_at"?: string | null,"created_at"?: string,"destination_hash"?: string,"expires_at"?: string,"id"?: string,"purpose"?: string,"tenant_id"?: string,"verified_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "online_verifications_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "online_verifications_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"payments": {
                  Row: {
                    "amount_minor": number,"branch_id": string,"business_date": string,"client_id": string | null,"created_at": string,"created_by": string,"id": string,"out_of_session": boolean | null,"payment_method": string,"payment_type": string,"reason": string | null,"refunds_payment_id": string | null,"register_session_id": string | null,"sale_id": string,"tenant_id": string
                  }
                  Insert: {
                    "amount_minor": number,"branch_id": string,"business_date": string,"client_id"?: string | null,"created_at"?: string,"created_by": string,"id"?: string,"out_of_session"?: never,"payment_method": string,"payment_type": string,"reason"?: string | null,"refunds_payment_id"?: string | null,"register_session_id"?: string | null,"sale_id": string,"tenant_id": string
                  }
                  Update: {
                    "amount_minor"?: number,"branch_id"?: string,"business_date"?: string,"client_id"?: string | null,"created_at"?: string,"created_by"?: string,"id"?: string,"out_of_session"?: never,"payment_method"?: string,"payment_type"?: string,"reason"?: string | null,"refunds_payment_id"?: string | null,"register_session_id"?: string | null,"sale_id"?: string,"tenant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_client_id_tenant_id_fkey"
      columns: ["client_id","tenant_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "payments_refunds_payment_id_tenant_id_fkey"
      columns: ["refunds_payment_id","tenant_id"]
isOneToOne: false
      referencedRelation: "payments"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "payments_register_session_id_branch_id_tenant_id_fkey"
      columns: ["register_session_id","branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "register_sessions"
      referencedColumns: ["id","branch_id","tenant_id"]
    },{
      foreignKeyName: "payments_sale_id_branch_id_tenant_id_fkey"
      columns: ["sale_id","branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "sales"
      referencedColumns: ["id","branch_id","tenant_id"]
    },{
      foreignKeyName: "payments_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"plan_features": {
                  Row: {
                    "created_at": string,"feature": string,"plan_code": string
                  }
                  Insert: {
                    "created_at"?: string,"feature": string,"plan_code": string
                  }
                  Update: {
                    "created_at"?: string,"feature"?: string,"plan_code"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "plan_features_plan_code_fkey"
      columns: ["plan_code"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["code"]
    }
                  ]
                },"plans": {
                  Row: {
                    "code": string,"created_at": string,"is_active": boolean,"name_ar": string,"name_en": string,"updated_at": string
                  }
                  Insert: {
                    "code": string,"created_at"?: string,"is_active"?: boolean,"name_ar": string,"name_en": string,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"is_active"?: boolean,"name_ar"?: string,"name_en"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"full_name": string,"id": string,"locale": string,"phone": string | null,"updated_at": string
                  }
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"full_name": string,"id": string,"locale"?: string,"phone"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"full_name"?: string,"id"?: string,"locale"?: string,"phone"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"rate_limit_buckets": {
                  Row: {
                    "key": string,"tokens_milli": number,"updated_at": string
                  }
                  Insert: {
                    "key": string,"tokens_milli": number,"updated_at"?: string
                  }
                  Update: {
                    "key"?: string,"tokens_milli"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"rate_limit_trips": {
                  Row: {
                    "count": number,"day": string,"rule": string,"tenant_id": string
                  }
                  Insert: {
                    "count": number,"day": string,"rule": string,"tenant_id": string
                  }
                  Update: {
                    "count"?: number,"day"?: string,"rule"?: string,"tenant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rate_limit_trips_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"register_sessions": {
                  Row: {
                    "branch_id": string,"business_date": string,"close_note": string | null,"closed_at": string | null,"closed_by": string | null,"counted_cash_minor": number | null,"created_at": string,"difference_minor": number | null,"expected_cash_minor": number | null,"id": string,"opened_at": string,"opened_by": string,"opening_cash_minor": number,"tenant_id": string,"updated_at": string
                  }
                  Insert: {
                    "branch_id": string,"business_date": string,"close_note"?: string | null,"closed_at"?: string | null,"closed_by"?: string | null,"counted_cash_minor"?: number | null,"created_at"?: string,"difference_minor"?: number | null,"expected_cash_minor"?: number | null,"id"?: string,"opened_at"?: string,"opened_by": string,"opening_cash_minor": number,"tenant_id": string,"updated_at"?: string
                  }
                  Update: {
                    "branch_id"?: string,"business_date"?: string,"close_note"?: string | null,"closed_at"?: string | null,"closed_by"?: string | null,"counted_cash_minor"?: number | null,"created_at"?: string,"difference_minor"?: number | null,"expected_cash_minor"?: number | null,"id"?: string,"opened_at"?: string,"opened_by"?: string,"opening_cash_minor"?: number,"tenant_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "register_sessions_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "register_sessions_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"sale_items": {
                  Row: {
                    "appointment_id": string | null,"appointment_item_id": string | null,"branch_id": string,"created_at": string,"created_by": string | null,"discount_fixed_minor": number,"discount_percent_bp": number,"discount_reason": string | null,"id": string,"item_id": string | null,"item_type": string,"line_base_minor": number,"line_discount_minor": number,"line_no": number,"line_total_minor": number,"name_ar": string | null,"name_en": string | null,"quantity": number,"sale_discount_alloc_minor": number,"sale_id": string,"staff_id": string | null,"tax_inclusive": boolean,"tax_minor": number,"tax_rate_bp": number,"tax_rate_id": string,"taxable_base_minor": number,"tenant_id": string,"unit_price_minor": number
                  }
                  Insert: {
                    "appointment_id"?: string | null,"appointment_item_id"?: string | null,"branch_id": string,"created_at"?: string,"created_by"?: string | null,"discount_fixed_minor"?: number,"discount_percent_bp"?: number,"discount_reason"?: string | null,"id"?: string,"item_id"?: string | null,"item_type": string,"line_base_minor": number,"line_discount_minor"?: number,"line_no": number,"line_total_minor": number,"name_ar"?: string | null,"name_en"?: string | null,"quantity": number,"sale_discount_alloc_minor"?: number,"sale_id": string,"staff_id"?: string | null,"tax_inclusive": boolean,"tax_minor": number,"tax_rate_bp": number,"tax_rate_id": string,"taxable_base_minor": number,"tenant_id": string,"unit_price_minor": number
                  }
                  Update: {
                    "appointment_id"?: string | null,"appointment_item_id"?: string | null,"branch_id"?: string,"created_at"?: string,"created_by"?: string | null,"discount_fixed_minor"?: number,"discount_percent_bp"?: number,"discount_reason"?: string | null,"id"?: string,"item_id"?: string | null,"item_type"?: string,"line_base_minor"?: number,"line_discount_minor"?: number,"line_no"?: number,"line_total_minor"?: number,"name_ar"?: string | null,"name_en"?: string | null,"quantity"?: number,"sale_discount_alloc_minor"?: number,"sale_id"?: string,"staff_id"?: string | null,"tax_inclusive"?: boolean,"tax_minor"?: number,"tax_rate_bp"?: number,"tax_rate_id"?: string,"taxable_base_minor"?: number,"tenant_id"?: string,"unit_price_minor"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "sale_items_appointment_id_tenant_id_fkey"
      columns: ["appointment_id","tenant_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "sale_items_appointment_item_id_tenant_id_fkey"
      columns: ["appointment_item_id","tenant_id"]
isOneToOne: false
      referencedRelation: "appointment_items"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "sale_items_item_id_tenant_id_fkey"
      columns: ["item_id","tenant_id"]
isOneToOne: false
      referencedRelation: "service_effective_values"
      referencedColumns: ["service_id","tenant_id"]
    },{
      foreignKeyName: "sale_items_item_id_tenant_id_fkey"
      columns: ["item_id","tenant_id"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "sale_items_sale_id_branch_id_tenant_id_fkey"
      columns: ["sale_id","branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "sales"
      referencedColumns: ["id","branch_id","tenant_id"]
    },{
      foreignKeyName: "sale_items_staff_id_tenant_id_fkey"
      columns: ["staff_id","tenant_id"]
isOneToOne: false
      referencedRelation: "staff_members"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "sale_items_tax_rate_id_tenant_id_fkey"
      columns: ["tax_rate_id","tenant_id"]
isOneToOne: false
      referencedRelation: "tax_rates"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "sale_items_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"sales": {
                  Row: {
                    "appointment_id": string | null,"branch_id": string,"business_date": string,"client_id": string | null,"created_at": string,"created_by": string | null,"currency_code": string,"discount_reason": string | null,"due_minor": number | null,"grand_total_minor": number | null,"id": string,"invoice_number": string,"invoice_seq": number,"line_discount_minor": number,"notes": string | null,"paid_minor": number,"receipt_language": string,"refunded_minor": number,"sale_discount_fixed_minor": number,"sale_discount_minor": number,"sale_discount_percent_bp": number,"status": string,"subtotal_minor": number,"tax_minor": number,"tenant_id": string,"tip_minor": number,"total_minor": number,"updated_at": string,"updated_by": string | null,"void_reason": string | null,"voided_at": string | null,"voided_by": string | null
                  }
                  Insert: {
                    "appointment_id"?: string | null,"branch_id": string,"business_date": string,"client_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"currency_code": string,"discount_reason"?: string | null,"due_minor"?: never,"grand_total_minor"?: never,"id"?: string,"invoice_number": string,"invoice_seq": number,"line_discount_minor"?: number,"notes"?: string | null,"paid_minor"?: number,"receipt_language": string,"refunded_minor"?: number,"sale_discount_fixed_minor"?: number,"sale_discount_minor"?: number,"sale_discount_percent_bp"?: number,"status": string,"subtotal_minor": number,"tax_minor"?: number,"tenant_id": string,"tip_minor"?: number,"total_minor": number,"updated_at"?: string,"updated_by"?: string | null,"void_reason"?: string | null,"voided_at"?: string | null,"voided_by"?: string | null
                  }
                  Update: {
                    "appointment_id"?: string | null,"branch_id"?: string,"business_date"?: string,"client_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"currency_code"?: string,"discount_reason"?: string | null,"due_minor"?: never,"grand_total_minor"?: never,"id"?: string,"invoice_number"?: string,"invoice_seq"?: number,"line_discount_minor"?: number,"notes"?: string | null,"paid_minor"?: number,"receipt_language"?: string,"refunded_minor"?: number,"sale_discount_fixed_minor"?: number,"sale_discount_minor"?: number,"sale_discount_percent_bp"?: number,"status"?: string,"subtotal_minor"?: number,"tax_minor"?: number,"tenant_id"?: string,"tip_minor"?: number,"total_minor"?: number,"updated_at"?: string,"updated_by"?: string | null,"void_reason"?: string | null,"voided_at"?: string | null,"voided_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "sales_appointment_id_tenant_id_fkey"
      columns: ["appointment_id","tenant_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "sales_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "sales_client_id_tenant_id_fkey"
      columns: ["client_id","tenant_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "sales_currency_code_fkey"
      columns: ["currency_code"]
isOneToOne: false
      referencedRelation: "currencies"
      referencedColumns: ["code"]
    },{
      foreignKeyName: "sales_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"service_branch_overrides": {
                  Row: {
                    "branch_id": string,"buffer_after_minutes": number | null,"buffer_before_minutes": number | null,"created_at": string,"created_by": string | null,"duration_minutes": number | null,"id": string,"is_enabled": boolean,"price_minor": number | null,"service_id": string,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "branch_id": string,"buffer_after_minutes"?: number | null,"buffer_before_minutes"?: number | null,"created_at"?: string,"created_by"?: string | null,"duration_minutes"?: number | null,"id"?: string,"is_enabled"?: boolean,"price_minor"?: number | null,"service_id": string,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "branch_id"?: string,"buffer_after_minutes"?: number | null,"buffer_before_minutes"?: number | null,"created_at"?: string,"created_by"?: string | null,"duration_minutes"?: number | null,"id"?: string,"is_enabled"?: boolean,"price_minor"?: number | null,"service_id"?: string,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "service_branch_overrides_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "service_branch_overrides_service_id_tenant_id_fkey"
      columns: ["service_id","tenant_id"]
isOneToOne: false
      referencedRelation: "service_effective_values"
      referencedColumns: ["service_id","tenant_id"]
    },{
      foreignKeyName: "service_branch_overrides_service_id_tenant_id_fkey"
      columns: ["service_id","tenant_id"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "service_branch_overrides_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"service_categories": {
                  Row: {
                    "created_at": string,"created_by": string | null,"id": string,"is_active": boolean,"name_ar": string | null,"name_en": string | null,"sort_order": number,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en"?: string | null,"sort_order"?: number,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en"?: string | null,"sort_order"?: number,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "service_categories_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"service_staff": {
                  Row: {
                    "branch_id": string,"created_at": string,"created_by": string | null,"id": string,"service_id": string,"staff_id": string,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "branch_id": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"service_id": string,"staff_id": string,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "branch_id"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"service_id"?: string,"staff_id"?: string,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "service_staff_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "service_staff_service_id_tenant_id_fkey"
      columns: ["service_id","tenant_id"]
isOneToOne: false
      referencedRelation: "service_effective_values"
      referencedColumns: ["service_id","tenant_id"]
    },{
      foreignKeyName: "service_staff_service_id_tenant_id_fkey"
      columns: ["service_id","tenant_id"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "service_staff_staff_id_branch_id_fkey"
      columns: ["staff_id","branch_id"]
isOneToOne: false
      referencedRelation: "staff_branch_assignments"
      referencedColumns: ["staff_id","branch_id"]
    },{
      foreignKeyName: "service_staff_staff_id_tenant_id_fkey"
      columns: ["staff_id","tenant_id"]
isOneToOne: false
      referencedRelation: "staff_members"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "service_staff_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"services": {
                  Row: {
                    "buffer_after_minutes": number,"buffer_before_minutes": number,"category_id": string,"created_at": string,"created_by": string | null,"description_ar": string | null,"description_en": string | null,"duration_minutes": number,"id": string,"is_active": boolean,"name_ar": string | null,"name_en": string | null,"online_bookable": boolean,"price_minor": number,"search_text": string | null,"sort_order": number,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "buffer_after_minutes"?: number,"buffer_before_minutes"?: number,"category_id": string,"created_at"?: string,"created_by"?: string | null,"description_ar"?: string | null,"description_en"?: string | null,"duration_minutes": number,"id"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en"?: string | null,"online_bookable"?: boolean,"price_minor": number,"search_text"?: never,"sort_order"?: number,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "buffer_after_minutes"?: number,"buffer_before_minutes"?: number,"category_id"?: string,"created_at"?: string,"created_by"?: string | null,"description_ar"?: string | null,"description_en"?: string | null,"duration_minutes"?: number,"id"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en"?: string | null,"online_bookable"?: boolean,"price_minor"?: number,"search_text"?: never,"sort_order"?: number,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "services_category_id_tenant_id_fkey"
      columns: ["category_id","tenant_id"]
isOneToOne: false
      referencedRelation: "service_categories"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "services_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"settings": {
                  Row: {
                    "all_branches": boolean,"branch_id": string | null,"created_at": string,"created_by": string | null,"id": string,"key": string,"tenant_id": string,"updated_at": string,"updated_by": string | null,"value": NonNullable<Json>
                  }
                  Insert: {
                    "all_branches"?: boolean,"branch_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"key": string,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null,"value": NonNullable<Json>
                  }
                  Update: {
                    "all_branches"?: boolean,"branch_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"key"?: string,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "settings_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "settings_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"shifts": {
                  Row: {
                    "branch_id": string,"created_at": string,"created_by": string | null,"ends_at": string,"id": string,"staff_id": string,"starts_at": string,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "branch_id": string,"created_at"?: string,"created_by"?: string | null,"ends_at": string,"id"?: string,"staff_id": string,"starts_at": string,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "branch_id"?: string,"created_at"?: string,"created_by"?: string | null,"ends_at"?: string,"id"?: string,"staff_id"?: string,"starts_at"?: string,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "shifts_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "shifts_staff_id_tenant_id_fkey"
      columns: ["staff_id","tenant_id"]
isOneToOne: false
      referencedRelation: "staff_members"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "shifts_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"staff_branch_assignments": {
                  Row: {
                    "branch_id": string,"created_at": string,"created_by": string | null,"id": string,"is_bookable": boolean,"is_default": boolean,"staff_id": string,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "branch_id": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_bookable"?: boolean,"is_default"?: boolean,"staff_id": string,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "branch_id"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_bookable"?: boolean,"is_default"?: boolean,"staff_id"?: string,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "staff_branch_assignments_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "staff_branch_assignments_staff_id_tenant_id_fkey"
      columns: ["staff_id","tenant_id"]
isOneToOne: false
      referencedRelation: "staff_members"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "staff_branch_assignments_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"staff_members": {
                  Row: {
                    "created_at": string,"created_by": string | null,"email": string | null,"full_name_ar": string | null,"full_name_en": string | null,"id": string,"is_active": boolean,"is_bookable": boolean,"job_title_ar": string | null,"job_title_en": string | null,"online_bookable": boolean,"phone": string | null,"search_text": string | null,"tenant_id": string,"updated_at": string,"updated_by": string | null,"user_id": string | null
                  }
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"email"?: string | null,"full_name_ar"?: string | null,"full_name_en"?: string | null,"id"?: string,"is_active"?: boolean,"is_bookable"?: boolean,"job_title_ar"?: string | null,"job_title_en"?: string | null,"online_bookable"?: boolean,"phone"?: string | null,"search_text"?: never,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"email"?: string | null,"full_name_ar"?: string | null,"full_name_en"?: string | null,"id"?: string,"is_active"?: boolean,"is_bookable"?: boolean,"job_title_ar"?: string | null,"job_title_en"?: string | null,"online_bookable"?: boolean,"phone"?: string | null,"search_text"?: never,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "staff_members_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"tax_rates": {
                  Row: {
                    "created_at": string,"created_by": string | null,"id": string,"is_active": boolean,"is_default": boolean,"is_inclusive": boolean,"name_ar": string | null,"name_en": string | null,"rate_bp": number,"tenant_id": string,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"is_active"?: boolean,"is_default"?: boolean,"is_inclusive"?: boolean,"name_ar"?: string | null,"name_en"?: string | null,"rate_bp": number,"tenant_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"is_active"?: boolean,"is_default"?: boolean,"is_inclusive"?: boolean,"name_ar"?: string | null,"name_en"?: string | null,"rate_bp"?: number,"tenant_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "tax_rates_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"tenants": {
                  Row: {
                    "created_at": string,"currency_code": string,"default_locale": string,"id": string,"is_active": boolean,"name_ar": string | null,"name_en": string,"plan": string,"slug": string,"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"currency_code"?: string,"default_locale"?: string,"id"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en": string,"plan"?: string,"slug": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"currency_code"?: string,"default_locale"?: string,"id"?: string,"is_active"?: boolean,"name_ar"?: string | null,"name_en"?: string,"plan"?: string,"slug"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tenants_currency_code_fkey"
      columns: ["currency_code"]
isOneToOne: false
      referencedRelation: "currencies"
      referencedColumns: ["code"]
    },{
      foreignKeyName: "tenants_plan_fkey"
      columns: ["plan"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["code"]
    }
                  ]
                },"tips": {
                  Row: {
                    "amount_minor": number,"branch_id": string,"created_at": string,"created_by": string | null,"id": string,"sale_id": string,"staff_id": string,"tenant_id": string
                  }
                  Insert: {
                    "amount_minor": number,"branch_id": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"sale_id": string,"staff_id": string,"tenant_id": string
                  }
                  Update: {
                    "amount_minor"?: number,"branch_id"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"sale_id"?: string,"staff_id"?: string,"tenant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tips_sale_id_branch_id_tenant_id_fkey"
      columns: ["sale_id","branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "sales"
      referencedColumns: ["id","branch_id","tenant_id"]
    },{
      foreignKeyName: "tips_staff_id_tenant_id_fkey"
      columns: ["staff_id","tenant_id"]
isOneToOne: false
      referencedRelation: "staff_members"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "tips_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "client_consent_current": {
                  Row: {
                    "channel": string | null,"client_id": string | null,"purpose": string | null,"recorded_at": string | null,"source": string | null,"status": string | null,"tenant_id": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "client_consents_client_id_tenant_id_fkey"
      columns: ["client_id","tenant_id"]
isOneToOne: false
      referencedRelation: "clients"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "client_consents_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"service_effective_values": {
                  Row: {
                    "branch_id": string | null,"buffer_after_minutes": number | null,"buffer_before_minutes": number | null,"category_id": string | null,"duration_minutes": number | null,"has_override": boolean | null,"is_enabled": boolean | null,"name_ar": string | null,"name_en": string | null,"price_minor": number | null,"service_id": string | null,"tenant_id": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "services_category_id_tenant_id_fkey"
      columns: ["category_id","tenant_id"]
isOneToOne: false
      referencedRelation: "service_categories"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "services_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"service_eligible_staff": {
                  Row: {
                    "branch_id": string | null,"full_name_ar": string | null,"full_name_en": string | null,"service_id": string | null,"staff_id": string | null,"tenant_id": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "service_staff_branch_id_tenant_id_fkey"
      columns: ["branch_id","tenant_id"]
isOneToOne: false
      referencedRelation: "branches"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "service_staff_service_id_tenant_id_fkey"
      columns: ["service_id","tenant_id"]
isOneToOne: false
      referencedRelation: "service_effective_values"
      referencedColumns: ["service_id","tenant_id"]
    },{
      foreignKeyName: "service_staff_service_id_tenant_id_fkey"
      columns: ["service_id","tenant_id"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "service_staff_staff_id_branch_id_fkey"
      columns: ["staff_id","branch_id"]
isOneToOne: false
      referencedRelation: "staff_branch_assignments"
      referencedColumns: ["staff_id","branch_id"]
    },{
      foreignKeyName: "service_staff_staff_id_tenant_id_fkey"
      columns: ["staff_id","tenant_id"]
isOneToOne: false
      referencedRelation: "staff_members"
      referencedColumns: ["id","tenant_id"]
    },{
      foreignKeyName: "service_staff_tenant_id_fkey"
      columns: ["tenant_id"]
isOneToOne: false
      referencedRelation: "tenants"
      referencedColumns: ["id"]
    }
                  ]
                },"staff_client_cards": {
                  Row: {
                    "alerts": string | null,"allergies": string | null,"first_name": string | null,"first_name_alt": string | null,"has_safety_flags": boolean | null,"id": string | null,"last_name": string | null,"last_name_alt": string | null,"phone": string | null,"tenant_id": string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "anonymize_client":
{ Args: { "p_actor": string,"p_client_id": string,"p_tenant_id": string }; Returns: Json
                           },
"apply_membership_change":
{ Args: { "p_action": string,"p_actor": string,"p_branch_id"?: string,"p_membership_id"?: string,"p_role"?: string,"p_tenant_id": string,"p_user_id"?: string }; Returns: string
                           },
"appointment_transition_kind":
{ Args: { "p_from": string,"p_to": string }; Returns: string
                           },
"archive_branch":
{ Args: { "p_branch_id": string }; Returns: undefined
                           },
"attach_appointment_client":
{ Args: { "p_actor": string,"p_appointment_id": string,"p_client_id": string,"p_tenant_id": string }; Returns: Json
                           },
"authorize_branch":
{ Args: { "p_branch_id": string,"p_roles": (string)[] }; Returns: string
                           },
"authorize_export_download":
{ Args: { "p_file_key": string,"p_job_id": string,"p_volume"?: number }; Returns: Json
                           },
"authorize_tenant_owner":
{ Args: { "p_tenant_id": string }; Returns: undefined
                           },
"availability_branches_of":
{ Args: { "p_rows": Json,"p_scope": string }; Returns: (string)[]
                           },
"availability_pending_branches":
{ Args: Record<PropertyKey, never>; Returns: (string)[]
                           },
"blocked_time_actor_may_write":
{ Args: { "p_actor": string,"p_all_branches": boolean,"p_branch_id": string,"p_staff_id": string,"p_tenant_id": string }; Returns: boolean
                           },
"blocked_time_check_conflicts":
{ Args: { "p_ends_at": string,"p_ignore_id": string,"p_staff_id": string,"p_starts_at": string }; Returns: undefined
                           },
"blocked_time_check_values":
{ Args: { "p_blocked_time_type_id": string,"p_ends_at": string,"p_starts_at": string,"p_tenant_id": string }; Returns: undefined
                           },
"book_appointment":
{ Args: { "p_actor": string,"p_branch_id": string,"p_client_id": string,"p_items": Json,"p_notes"?: string,"p_override_reason"?: string,"p_overrides"?: (string)[],"p_tenant_id": string }; Returns: Json
                           },
"booking_actor_has_role":
{ Args: { "p_actor": string,"p_branch_id": string,"p_roles": (string)[],"p_tenant_id": string }; Returns: boolean
                           },
"booking_available_slots":
{ Args: { "p_actor": string,"p_branch_id": string,"p_date": string,"p_held_items"?: Json,"p_ignore_appointment_id"?: string,"p_service_id": string,"p_staff_ids"?: (string)[],"p_tenant_id": string }; Returns: {
              "ends_at": string,"staff_id": string,"starts_at": string
            }[]
                           },
"booking_cancel_internal":
{ Args: { "p_actor": string,"p_appointment_id": string,"p_cancellation_reason_id": string,"p_note": string,"p_tenant_id": string }; Returns: Json
                           },
"booking_check_client":
{ Args: { "p_client_id": string,"p_tenant_id": string }; Returns: undefined
                           },
"booking_check_conflicts":
{ Args: { "p_busy": unknown,"p_ignore_appointment_id": string,"p_staff_id": string }; Returns: undefined
                           },
"booking_check_override_gate":
{ Args: { "p_overrides": (string)[],"p_violations": Json }; Returns: undefined
                           },
"booking_check_override_request":
{ Args: { "p_actor": string,"p_branch_id": string,"p_overrides": (string)[],"p_tenant_id": string }; Returns: undefined
                           },
"booking_check_self_overlap":
{ Args: { "p_items": Json }; Returns: undefined
                           },
"booking_create_internal":
{ Args: { "p_actor": string,"p_booked_via": string,"p_branch_id": string,"p_client_id": string,"p_items": Json,"p_notes": string,"p_online_source": string,"p_override_reason": string,"p_overrides": (string)[],"p_tenant_id": string }; Returns: Json
                           },
"booking_lock_appointment":
{ Args: { "p_appointment_id": string,"p_extra_staff": (string)[],"p_tenant_id": string }; Returns: {
              "booked_via": string,
"branch_id": string,
"cancellation_note": string | null,
"cancellation_reason_id": string | null,
"cancelled_at": string | null,
"cancelled_by": string | null,
"client_id": string | null,
"created_at": string,
"created_by": string | null,
"id": string,
"notes": string | null,
"online_source": string | null,
"ref_number": string,
"scheduled_end": string,
"scheduled_start": string,
"status": string,
"tenant_id": string,
"updated_at": string,
"updated_by": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "appointments"
        isOneToOne: true
        isSetofReturn: false
      } },
"booking_lock_staff":
{ Args: { "p_staff_ids": (string)[] }; Returns: undefined
                           },
"booking_slots_internal":
{ Args: { "p_branch_id": string,"p_date": string,"p_held_items": Json,"p_ignore_appointment_id": string,"p_service_id": string,"p_staff_ids": (string)[],"p_tenant_id": string }; Returns: {
              "ends_at": string,"staff_id": string,"starts_at": string
            }[]
                           },
"booking_soft_rule_violations":
{ Args: { "p_branch_id": string,"p_busy": unknown,"p_staff_id": string }; Returns: (string)[]
                           },
"branch_notification_config":
{ Args: { "p_branch_id": string }; Returns: {
              "channels": (string)[],"confirm_desk_bookings": boolean,"reminder_offsets_minutes": (number)[],"reminders_enabled": boolean
            }[]
                           },
"branch_open_ranges":
{ Args: { "p_branch_id": string,"p_from": string,"p_to": string }; Returns: unknown
                           },
"branch_staff_schedule":
{ Args: { "p_branch_id": string,"p_from": string,"p_tenant_id": string,"p_to": string }; Returns: {
              "all_branches": boolean,"blocked_time_type_id": string,"branch_id": string,"ends_at": string,"entry_id": string,"entry_type": string,"notes": string,"staff_id": string,"starts_at": string
            }[]
                           },
"bump_branch_availability":
{ Args: { "p_branch_ids": (string)[] }; Returns: undefined
                           },
"can_grant_role":
{ Args: { "p_actor": string,"p_branch_id": string,"p_role": string,"p_tenant_id": string }; Returns: boolean
                           },
"cancel_appointment":
{ Args: { "p_actor": string,"p_appointment_id": string,"p_cancellation_reason_id": string,"p_note"?: string,"p_tenant_id": string }; Returns: Json
                           },
"catalogue_actor_is_owner":
{ Args: { "p_actor": string,"p_tenant_id": string }; Returns: boolean
                           },
"catalogue_actor_manages_branch":
{ Args: { "p_actor": string,"p_branch_id": string,"p_tenant_id": string }; Returns: boolean
                           },
"checkout_business_date":
{ Args: { "p_at": string,"p_branch_id": string }; Returns: string
                           },
"checkout_cash_session":
{ Args: { "p_branch_id": string,"p_required": boolean,"p_tenant_id": string }; Returns: string
                           },
"checkout_compute_totals":
{ Args: { "p_lines": Json,"p_payments"?: Json,"p_sale_discount"?: Json,"p_tips"?: Json }; Returns: Json
                           },
"checkout_div_half_up":
{ Args: { "p_d": number,"p_n": number }; Returns: number
                           },
"checkout_insert_refund":
{ Args: { "p_actor": string,"p_payment": Database["public"]['Tables']["payments"]['Row'],"p_reason": string }; Returns: Json
                           },
"checkout_json_int":
{ Args: { "p_max": number,"p_min": number,"p_name": string,"p_reason": string,"p_value": Json }; Returns: number
                           },
"checkout_mul_div_half_up":
{ Args: { "p_a": number,"p_b": number,"p_d": number }; Returns: number
                           },
"checkout_safe_sum":
{ Args: { "p_name": string,"p_values": (number)[] }; Returns: number
                           },
"checkout_staff_at_branch":
{ Args: { "p_branch_id": string,"p_staff_id": string,"p_tenant_id": string }; Returns: boolean
                           },
"clear_client_review":
{ Args: { "p_client_id": string }; Returns: undefined
                           },
"client_actor_has_role":
{ Args: { "p_actor": string,"p_roles": (string)[],"p_tenant_id": string }; Returns: boolean
                           },
"client_import_batch_summary":
{ Args: { "p_batch": Database["public"]['Tables']["client_import_batches"]['Row'] }; Returns: Json
                           },
"client_import_read":
{ Args: { "p_qty"?: number,"p_vt"?: number }; Returns: {
              "batch_id": string,"chunk": number,"msg_id": number,"read_ct": number
            }[]
                           },
"client_is_bookable":
{ Args: { "p_client_id": string,"p_tenant_id": string }; Returns: boolean
                           },
"client_name_key":
{ Args: { "p_first": string,"p_last": string }; Returns: string
                           },
"client_personal_audit_keys":
{ Args: Record<PropertyKey, never>; Returns: (string)[]
                           },
"client_sales_summary":
{ Args: { "p_client_id": string,"p_tenant_id": string }; Returns: {
              "balance_minor": number,"branch_id": string,"sale_count": number,"spent_minor": number
            }[]
                           },
"client_tags":
{ Args: { "p_tenant_id": string }; Returns: {
              "client_count": number,"tag": string
            }[]
                           },
"close_register":
{ Args: { "p_actor": string,"p_counted_cash_minor": number,"p_expected_cash_minor": number,"p_note"?: string,"p_session_id": string,"p_tenant_id": string }; Returns: Json
                           },
"colleague_profiles":
{ Args: { "p_tenant_id": string }; Returns: {
              "avatar_url": string,"full_name": string,"id": string
            }[]
                           },
"copy_shift_week":
{ Args: { "p_actor": string,"p_branch_id": string,"p_replace": boolean,"p_source_week": string,"p_staff_ids": (string)[],"p_target_week": string,"p_tenant_id": string }; Returns: Json
                           },
"create_blocked_time":
{ Args: { "p_all_branches": boolean,"p_blocked_time_type_id": string,"p_branch_id": string,"p_ends_at": string,"p_notes"?: string,"p_staff_id": string,"p_starts_at": string,"p_tenant_id": string }; Returns: string
                           },
"create_branch":
{ Args: { "p_branch": Json,"p_hours"?: Json,"p_tenant_id": string }; Returns: string
                           },
"create_client":
{ Args: { "p_client": Json,"p_proceeded_duplicate_ids"?: (string)[],"p_tenant_id": string }; Returns: string
                           },
"create_client_import_batch":
{ Args: { "p_actor": string,"p_batch_key": string,"p_file_name": string,"p_policy": string,"p_rows": Json,"p_tenant_id": string }; Returns: Json
                           },
"create_sale":
{ Args: { "p_actor": string,"p_branch_id": string,"p_input": Json,"p_tenant_id": string }; Returns: Json
                           },
"current_branch_scope":
{ Args: { "p_tenant_id": string }; Returns: string[]
                           },
"current_staff_appointment_ids":
{ Args: Record<PropertyKey, never>; Returns: string[]
                           },
"current_staff_ids":
{ Args: Record<PropertyKey, never>; Returns: string[]
                           },
"current_tenant_ids":
{ Args: Record<PropertyKey, never>; Returns: string[]
                           },
"decide_data_access_request":
{ Args: { "p_decision": string,"p_reason"?: string,"p_request_id": string,"p_tenant_id": string }; Returns: Json
                           },
"default_branch_hours":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"delete_blocked_time":
{ Args: { "p_id": string,"p_tenant_id": string }; Returns: undefined
                           },
"delete_closed_period":
{ Args: { "p_id": string }; Returns: undefined
                           },
"expire_data_access_requests":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"export_csv_row":
{ Args: { "p_cells": (string)[] }; Returns: string
                           },
"export_file_header":
{ Args: { "p_file_key": string }; Returns: (string)[]
                           },
"export_file_header_r11":
{ Args: { "p_file_key": string }; Returns: (string)[]
                           },
"export_file_part":
{ Args: { "p_file_key": string,"p_job_id": string,"p_part_no": number }; Returns: string
                           },
"export_job_audit":
{ Args: { "p_action": string,"p_actor": string,"p_fields"?: Json,"p_job": Database["public"]['Tables']["export_jobs"]['Row'] }; Returns: undefined
                           },
"export_job_summary":
{ Args: { "p_job": Database["public"]['Tables']["export_jobs"]['Row'] }; Returns: Json
                           },
"export_kind_allowed":
{ Args: { "p_branch_ids": (string)[],"p_kind": string,"p_tenant_id": string }; Returns: (string)[]
                           },
"export_kind_allowed_r10":
{ Args: { "p_branch_ids": (string)[],"p_kind": string,"p_tenant_id": string }; Returns: (string)[]
                           },
"export_kind_files":
{ Args: { "p_kind": string }; Returns: (string)[]
                           },
"export_kind_files_r11":
{ Args: { "p_kind": string }; Returns: (string)[]
                           },
"export_queue_read":
{ Args: { "p_qty"?: number,"p_vt"?: number }; Returns: {
              "file_key": string,"job_id": string,"msg_id": number,"part_no": number,"read_ct": number
            }[]
                           },
"export_slice":
{ Args: { "p_after": string,"p_file_key": string,"p_job": Database["public"]['Tables']["export_jobs"]['Row'],"p_limit": number }; Returns: {
              "k": string,"line": string
            }[]
                           },
"export_slice_client_data":
{ Args: { "p_after": string,"p_job": Database["public"]['Tables']["export_jobs"]['Row'],"p_limit": number }; Returns: {
              "k": string,"line": string
            }[]
                           },
"export_slice_r11":
{ Args: { "p_after": string,"p_file_key": string,"p_job": Database["public"]['Tables']["export_jobs"]['Row'],"p_limit": number }; Returns: {
              "k": string,"line": string
            }[]
                           },
"export_ts":
{ Args: { "p_at": string,"p_tz": string }; Returns: string
                           },
"fail_export_job":
{ Args: { "p_error": string,"p_job": Database["public"]['Tables']["export_jobs"]['Row'] }; Returns: undefined
                           },
"find_client_duplicates":
{ Args: { "p_client": Json,"p_exclude_id"?: string,"p_tenant_id": string }; Returns: {
              "email": string,"first_name": string,"first_name_alt": string,"id": string,"is_blocked": boolean,"last_name": string,"last_name_alt": string,"match_email": boolean,"match_name": boolean,"match_phone": boolean,"phone": string
            }[]
                           },
"find_client_duplicates_batch":
{ Args: { "p_actor": string,"p_rows": Json,"p_tenant_id": string }; Returns: {
              "client_ids": (string)[],"row_number": number
            }[]
                           },
"find_user_id_by_email":
{ Args: { "p_email": string }; Returns: string
                           },
"has_tenant_role":
{ Args: { "p_branch_id": string,"p_roles": (string)[],"p_tenant_id": string }; Returns: boolean
                           },
"has_tenant_role_any_branch":
{ Args: { "p_roles": (string)[],"p_tenant_id": string }; Returns: boolean
                           },
"holds_membership_authority":
{ Args: { "p_actor": string,"p_branch_id": string,"p_role": string,"p_tenant_id": string }; Returns: boolean
                           },
"holds_role_in_tenant":
{ Args: { "p_roles": (string)[],"p_tenant_id": string }; Returns: boolean
                           },
"home_today":
{ Args: { "p_at"?: string,"p_branch_ids"?: (string)[],"p_tenant_id": string }; Returns: Json
                           },
"is_client_tag_array":
{ Args: { "p_tags": Json }; Returns: boolean
                           },
"is_valid_timezone":
{ Args: { "p_timezone": string }; Returns: boolean
                           },
"jsonb_text_array":
{ Args: { "p_value": Json }; Returns: (string)[]
                           },
"kick_client_import_consumer":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"kick_notification_consumer":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"kick_report_export_consumer":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"link_staff_login":
{ Args: { "p_actor": string,"p_staff_id": string,"p_tenant_id": string,"p_user_id": string }; Returns: undefined
                           },
"list_tenant_members":
{ Args: { "p_tenant_id": string }; Returns: {
              "all_branches": boolean,"branch_id": string,"created_at": string,"email": string,"full_name": string,"invite_pending": boolean,"is_active": boolean,"membership_id": string,"role": string,"user_id": string
            }[]
                           },
"match_client_duplicates":
{ Args: { "p_inputs": Json,"p_tenant_id": string }; Returns: {
              "id": string,"match_email": boolean,"match_name": boolean,"match_phone": boolean,"ord": number
            }[]
                           },
"my_assignments":
{ Args: { "p_tenant_id": string }; Returns: {
              "branch_id": string,"branch_is_active": boolean,"branch_name_ar": string,"branch_name_en": string,"first_day_of_week": number,"is_bookable": boolean,"is_default": boolean,"staff_id": string,"time_format": number,"timezone": string
            }[]
                           },
"next_counter_value":
{ Args: { "p_branch_id": string,"p_kind": string }; Returns: number
                           },
"normalize_search":
{ Args: { "p_value": string }; Returns: string
                           },
"notification_claim":
{ Args: { "p_link_token_hash"?: string,"p_manage_token_hash"?: string,"p_message_id": string,"p_msg_id"?: number,"p_provider": string }; Returns: Json
                           },
"notification_delivery_rank":
{ Args: { "p_status": string }; Returns: number
                           },
"notification_delivery_report":
{ Args: { "p_error_code"?: string,"p_provider_message_id": string,"p_status": string }; Returns: Json
                           },
"notification_enqueue":
{ Args: { "p_appointment_id": string,"p_appointment_start": string,"p_branch_id": string,"p_client_id": string,"p_dedupe_key": string,"p_kind": string,"p_locale": string,"p_payload": Json,"p_requested_by": string,"p_scheduled_for": string,"p_skip_reason": string,"p_tenant_id": string }; Returns: string
                           },
"notification_locale":
{ Args: { "p_client_id": string,"p_requested": string,"p_tenant_id": string }; Returns: string
                           },
"notification_log_inline":
{ Args: { "p_branch_id": string,"p_code": string,"p_dedupe_key": string,"p_destination_hash": string,"p_destination_masked": string,"p_duration_ms": number,"p_kind": string,"p_locale": string,"p_outcome": string,"p_provider": string,"p_provider_message_id": string,"p_template_version": number,"p_tenant_id": string }; Returns: string
                           },
"notification_queue_depth":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"notification_read_batch":
{ Args: { "p_qty"?: number,"p_vt"?: number }; Returns: {
              "message_id": string,"msg_id": number,"read_ct": number
            }[]
                           },
"notification_record":
{ Args: { "p_attempt_no": number,"p_code": string,"p_destination_hash": string,"p_destination_masked": string,"p_duration_ms": number,"p_error_code": string,"p_max_attempts"?: number,"p_message_id": string,"p_msg_id"?: number,"p_outcome": string,"p_provider_message_id": string,"p_retry_seconds": number,"p_template_version": number }; Returns: Json
                           },
"notification_sweep_stuck":
{ Args: { "p_now"?: string }; Returns: number
                           },
"online_available_slots":
{ Args: { "p_branch_id": string,"p_date": string,"p_service_id": string,"p_staff_id"?: string,"p_tenant_id": string }; Returns: {
              "ends_at": string,"starts_at": string
            }[]
                           },
"online_book":
{ Args: { "p_branch_id": string,"p_contact": Json,"p_manage_token_hash": string,"p_service_id": string,"p_source": string,"p_staff_id": string,"p_starts_at": string,"p_tenant_id": string,"p_verification_id": string }; Returns: Json
                           },
"online_bump_daily":
{ Args: { "p_branch_id": string,"p_code_requests": number,"p_source": string,"p_tenant_id": string,"p_visits": number }; Returns: undefined
                           },
"online_cancel":
{ Args: { "p_token_hash": string }; Returns: Json
                           },
"online_catalogue":
{ Args: { "p_branch_id": string,"p_tenant_id": string }; Returns: Json
                           },
"online_check_choice":
{ Args: { "p_branch_id": string,"p_service_id": string,"p_show_staff": boolean,"p_staff_id": string,"p_tenant_id": string }; Returns: (string)[]
                           },
"online_consume_verification":
{ Args: { "p_branch_id": string,"p_destination_hash": string,"p_purpose": string,"p_tenant_id": string,"p_verification_id": string }; Returns: undefined
                           },
"online_manage_appointment":
{ Args: { "p_token_hash": string }; Returns: string
                           },
"online_manage_scope":
{ Args: { "p_token_hash": string }; Returns: Json
                           },
"online_manage_view":
{ Args: { "p_token_hash": string }; Returns: Json
                           },
"online_match_client":
{ Args: { "p_contact": Json,"p_tenant_id": string }; Returns: Record<string, unknown>
                           },
"online_opt_out":
{ Args: { "p_client_id": string,"p_purpose": string }; Returns: Json
                           },
"online_page":
{ Args: { "p_branch_id": string,"p_tenant_id": string }; Returns: {
              "branch_id": string,"cancel_cutoff_minutes": number,"min_notice_minutes": number,"show_staff": boolean,"slot_step_minutes": number,"tenant_id": string,"timezone": string,"window_days": number
            }[]
                           },
"online_record_code_request":
{ Args: { "p_branch_id": string,"p_source": string,"p_tenant_id": string }; Returns: undefined
                           },
"online_record_visit":
{ Args: { "p_branch_id": string,"p_source": string,"p_tenant_id": string }; Returns: undefined
                           },
"online_request_data_access":
{ Args: { "p_branch_id": string,"p_contact": Json,"p_locale"?: string,"p_tenant_id": string,"p_verification_id": string }; Returns: undefined
                           },
"online_resolve_branch":
{ Args: { "p_branch_slug": string,"p_tenant_slug": string }; Returns: Json
                           },
"online_settings_bool":
{ Args: { "p_key": string,"p_patch": Json }; Returns: boolean
                           },
"online_settings_int":
{ Args: { "p_key": string,"p_max": number,"p_min": number,"p_patch": Json,"p_reason": string }; Returns: number
                           },
"online_staff_ids":
{ Args: { "p_branch_id": string,"p_service_id": string,"p_tenant_id": string }; Returns: (string)[]
                           },
"online_verification_check":
{ Args: { "p_branch_id": string,"p_code_hash": string,"p_tenant_id": string,"p_verification_id": string }; Returns: Json
                           },
"online_verification_start":
{ Args: { "p_branch_id": string,"p_code_hash": string,"p_destination_hash": string,"p_purpose": string,"p_tenant_id": string }; Returns: Json
                           },
"open_register":
{ Args: { "p_actor": string,"p_branch_id": string,"p_opening_cash_minor": number,"p_tenant_id": string }; Returns: Json
                           },
"process_client_import_chunk":
{ Args: { "p_max_attempts"?: number,"p_msg_id": number }; Returns: Json
                           },
"process_export_slice":
{ Args: { "p_max_attempts"?: number,"p_msg_id": number }; Returns: Json
                           },
"provision_branch":
{ Args: { "p_branch": Json,"p_hours": Json,"p_requested_by": string,"p_tenant_id": string }; Returns: Json
                           },
"provision_branch_core":
{ Args: { "p_branch": Json,"p_hours": Json,"p_tenant_id": string }; Returns: string
                           },
"provision_tenant":
{ Args: { "p_branch": Json,"p_owner_id": string,"p_requested_by": string,"p_tenant": Json }; Returns: Json
                           },
"purge_cron_job_run_details":
{ Args: { "p_keep"?: string }; Returns: number
                           },
"purge_expired_exports":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"purge_notification_messages":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"purge_online_slot_cache":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"purge_online_tokens":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"purge_rate_limits":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"rate_limit_take":
{ Args: { "p_rules": Json }; Returns: Json
                           },
"record_client_duplicate_decision":
{ Args: { "p_client_id": string,"p_matched_ids": (string)[] }; Returns: undefined
                           },
"record_export":
{ Args: { "p_branch_ids": (string)[],"p_filters"?: Json,"p_kind": string,"p_row_count"?: number,"p_tenant_id": string }; Returns: number
                           },
"record_notification_test":
{ Args: { "p_actor_id": string,"p_branch_id": string,"p_channel": string,"p_destination_masked": string,"p_provider"?: string,"p_reason"?: string,"p_status": string,"p_tenant_id": string }; Returns: number
                           },
"redact_audit_fields":
{ Args: { "p_fields": Json,"p_keys": (string)[] }; Returns: Json
                           },
"redeem_export_download":
{ Args: { "p_token": string }; Returns: Json
                           },
"refund_payment":
{ Args: { "p_actor": string,"p_payment_id": string,"p_reason": string,"p_tenant_id": string }; Returns: Json
                           },
"register_cash_totals":
{ Args: { "p_session_id": string }; Returns: {
              "cash_payments_minor": number,"cash_refunds_minor": number,"expected_cash_minor": number,"opening_cash_minor": number,"payment_count": number,"refund_count": number
            }[]
                           },
"register_session_totals":
{ Args: { "p_session_id": string }; Returns: Json
                           },
"reminder_due_at":
{ Args: { "p_offset_minutes": number,"p_start": string,"p_timezone": string }; Returns: string
                           },
"reorder_catalogue":
{ Args: { "p_actor": string,"p_category_id": string,"p_ids": (string)[],"p_kind": string,"p_tenant_id": string }; Returns: undefined
                           },
"replace_branch_hours":
{ Args: { "p_branch_id": string,"p_hours": Json }; Returns: undefined
                           },
"report_appointments_summary":
{ Args: { "p_branch_ids"?: (string)[],"p_from"?: string,"p_tenant_id": string,"p_to"?: string }; Returns: Json
                           },
"report_branch_bounds":
{ Args: { "p_from": string,"p_scope": (string)[],"p_to": string }; Returns: {
              "branch_id": string,"ends_at": string,"starts_at": string,"timezone": string
            }[]
                           },
"report_branch_scope":
{ Args: { "p_branch_ids": (string)[],"p_roles": (string)[],"p_tenant_id": string }; Returns: (string)[]
                           },
"report_check_range":
{ Args: { "p_from": string,"p_to": string }; Returns: undefined
                           },
"report_client_list":
{ Args: { "p_after"?: string,"p_branch_ids"?: (string)[],"p_from"?: string,"p_limit"?: number,"p_mode"?: string,"p_tenant_id": string,"p_to"?: string }; Returns: Json
                           },
"report_currency":
{ Args: { "p_from": string,"p_scope": (string)[],"p_tenant_id": string,"p_to": string }; Returns: string
                           },
"report_daily_sales":
{ Args: { "p_branch_id": string,"p_from": string,"p_tenant_id": string,"p_to": string }; Returns: Json
                           },
"report_message_usage":
{ Args: { "p_month": string,"p_tenant_id": string }; Returns: Json
                           },
"report_online_booking":
{ Args: { "p_branch_ids"?: (string)[],"p_from"?: string,"p_tenant_id": string,"p_to"?: string }; Returns: Json
                           },
"report_own_sales":
{ Args: { "p_from": string,"p_tenant_id": string,"p_to": string }; Returns: Json
                           },
"report_payments_summary":
{ Args: { "p_branch_ids"?: (string)[],"p_from"?: string,"p_tenant_id": string,"p_to"?: string }; Returns: Json
                           },
"report_sales_summary":
{ Args: { "p_branch_ids"?: (string)[],"p_from"?: string,"p_staff_id"?: string,"p_tenant_id": string,"p_to"?: string }; Returns: Json
                           },
"report_shifts":
{ Args: { "p_branch_ids"?: (string)[],"p_from"?: string,"p_tenant_id": string,"p_to"?: string }; Returns: Json
                           },
"report_staff_performance":
{ Args: { "p_branch_ids"?: (string)[],"p_from"?: string,"p_tenant_id": string,"p_to"?: string }; Returns: Json
                           },
"report_taxes_summary":
{ Args: { "p_branch_ids"?: (string)[],"p_from"?: string,"p_tenant_id": string,"p_to"?: string }; Returns: Json
                           },
"request_receipt_email":
{ Args: { "p_locale"?: string,"p_request_key": string,"p_sale_id": string,"p_tenant_id": string }; Returns: Json
                           },
"reschedule_appointment":
{ Args: { "p_actor": string,"p_appointment_id": string,"p_items": Json,"p_override_reason"?: string,"p_overrides"?: (string)[],"p_target_branch_id": string,"p_tenant_id": string }; Returns: Json
                           },
"resolve_service":
{ Args: { "p_branch_id": string,"p_service_id": string }; Returns: {
              "branch_id": string,"buffer_after_minutes": number,"buffer_before_minutes": number,"duration_minutes": number,"is_enabled": boolean,"price_minor": number,"service_id": string,"service_name_ar": string,"service_name_en": string,"tenant_id": string
            }[]
                           },
"restore_branch":
{ Args: { "p_branch_id": string }; Returns: undefined
                           },
"retry_notification":
{ Args: { "p_confirm_duplicate"?: boolean,"p_message_id": string,"p_tenant_id": string }; Returns: Json
                           },
"schedule_due_reminders":
{ Args: { "p_now"?: string }; Returns: Json
                           },
"seed_tenant_catalogues":
{ Args: { "p_tenant_id": string }; Returns: undefined
                           },
"set_appointment_notes":
{ Args: { "p_actor": string,"p_appointment_id": string,"p_notes": string,"p_tenant_id": string }; Returns: Json
                           },
"set_appointment_status":
{ Args: { "p_actor": string,"p_appointment_id": string,"p_override"?: boolean,"p_reason"?: string,"p_status": string,"p_tenant_id": string }; Returns: Json
                           },
"set_blocked_time_type_active":
{ Args: { "p_id": string,"p_is_active": boolean }; Returns: undefined
                           },
"set_cancellation_reason_active":
{ Args: { "p_id": string,"p_is_active": boolean }; Returns: undefined
                           },
"set_client_blocked":
{ Args: { "p_actor": string,"p_blocked": boolean,"p_client_id": string,"p_reason"?: string,"p_tenant_id": string }; Returns: Json
                           },
"set_online_bookable":
{ Args: { "p_id": string,"p_kind": string,"p_value": boolean }; Returns: undefined
                           },
"settle_balance":
{ Args: { "p_actor": string,"p_expected_due_minor": number,"p_payments": Json,"p_sale_id": string,"p_tenant_id": string }; Returns: Json
                           },
"soft_delete_client":
{ Args: { "p_actor": string,"p_client_id": string,"p_tenant_id": string }; Returns: Json
                           },
"staff_actor_has_authority":
{ Args: { "p_actor": string,"p_staff_id": string,"p_tenant_id": string }; Returns: boolean
                           },
"staff_actor_is_tenant_wide":
{ Args: { "p_actor": string,"p_tenant_id": string }; Returns: boolean
                           },
"staff_actor_manages_branch":
{ Args: { "p_actor": string,"p_branch_id": string,"p_tenant_id": string }; Returns: boolean
                           },
"staff_assigned_at":
{ Args: { "p_branch_id": string,"p_staff_id": string }; Returns: boolean
                           },
"staff_in_caller_branches":
{ Args: { "p_roles": (string)[],"p_staff_id": string,"p_tenant_id": string }; Returns: boolean
                           },
"staff_login_status":
{ Args: { "p_staff_id": string,"p_tenant_id": string }; Returns: {
              "invite_pending": boolean,"login_email": string,"user_id": string
            }[]
                           },
"staff_schedulable_at":
{ Args: { "p_branch_id": string,"p_staff_id": string }; Returns: boolean
                           },
"staff_visible_clients":
{ Args: Record<PropertyKey, never>; Returns: {
              "alerts": string,"allergies": string,"first_name": string,"first_name_alt": string,"has_safety_flags": boolean,"id": string,"last_name": string,"last_name_alt": string,"phone": string,"tenant_id": string
            }[]
                           },
"start_export":
{ Args: { "p_branch_ids"?: (string)[],"p_filters"?: Json,"p_kind": string,"p_tenant_id": string }; Returns: Json
                           },
"tenant_asset_can_read":
{ Args: { "p_name": string }; Returns: boolean
                           },
"tenant_asset_can_write":
{ Args: { "p_name": string }; Returns: boolean
                           },
"tenant_asset_path":
{ Args: { "p_name": string }; Returns: {
              "branch_id": string,"kind": string,"tenant_id": string
            }[]
                           },
"tenant_currency_locked":
{ Args: { "p_tenant_id": string }; Returns: boolean
                           },
"tenant_has_feature":
{ Args: { "p_feature": string,"p_tenant_id": string }; Returns: boolean
                           },
"update_blocked_time":
{ Args: { "p_blocked_time_type_id": string,"p_ends_at": string,"p_id": string,"p_notes"?: string,"p_starts_at": string,"p_tenant_id": string }; Returns: undefined
                           },
"update_branch":
{ Args: { "p_branch_id": string,"p_patch": Json }; Returns: undefined
                           },
"update_notification_settings":
{ Args: { "p_branch_id": string,"p_patch": Json }; Returns: undefined
                           },
"update_online_booking_settings":
{ Args: { "p_branch_id": string,"p_patch": Json }; Returns: undefined
                           },
"update_tenant_details":
{ Args: { "p_patch": Json,"p_tenant_id": string }; Returns: undefined
                           },
"upsert_blocked_time_type":
{ Args: { "p_color": string,"p_id"?: string,"p_name_ar": string,"p_name_en": string,"p_sort_order"?: number,"p_tenant_id": string }; Returns: string
                           },
"upsert_cancellation_reason":
{ Args: { "p_id"?: string,"p_name_ar": string,"p_name_en": string,"p_sort_order"?: number,"p_tenant_id": string }; Returns: string
                           },
"upsert_closed_period":
{ Args: { "p_branch_id": string,"p_ends_on": string,"p_id"?: string,"p_name_ar": string,"p_name_en": string,"p_starts_on": string }; Returns: string
                           },
"upsert_service":
{ Args: { "p_actor": string,"p_service": Json,"p_tenant_id": string }; Returns: string
                           },
"upsert_staff_member":
{ Args: { "p_actor": string,"p_staff": Json,"p_tenant_id": string }; Returns: string
                           },
"upsert_tax_rate":
{ Args: { "p_rate": Json,"p_tenant_id": string }; Returns: string
                           },
"void_sale":
{ Args: { "p_actor": string,"p_reason": string,"p_sale_id": string,"p_tenant_id": string }; Returns: Json
                           },
"write_branch_hours":
{ Args: { "p_branch_id": string,"p_hours": Json,"p_tenant_id": string }; Returns: undefined
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
