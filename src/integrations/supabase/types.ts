export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_number: string
          balance: number | null
          bank_name: string
          branch: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          section_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_number: string
          balance?: number | null
          bank_name: string
          branch?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          section_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string
          balance?: number | null
          bank_name?: string
          branch?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          section_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_accounts: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          name: string
          section_id: string | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          name: string
          section_id?: string | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          name?: string
          section_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_accounts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: string | null
          cnic: string | null
          created_at: string | null
          email: string | null
          id: string
          is_regular: boolean | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cnic?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_regular?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cnic?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_regular?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_transactions: {
        Row: {
          amount: number
          bill_url: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string | null
          created_by: string | null
          date: string
          description: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          section_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bill_url?: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          created_by?: string | null
          date?: string
          description: string
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          section_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bill_url?: string | null
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          section_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_transactions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_year_settings: {
        Row: {
          created_at: string | null
          current_year: number
          id: string
          section_id: string | null
          start_day: number
          start_month: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_year: number
          id?: string
          section_id?: string | null
          start_day: number
          start_month: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_year?: number
          id?: string
          section_id?: string | null
          start_day?: number
          start_month?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_year_settings_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: true
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      income_transactions: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["income_category"]
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          donor_id: string | null
          donor_name: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_number: string | null
          section_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["income_category"]
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_number?: string | null
          section_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["income_category"]
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          receipt_number?: string | null
          section_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "income_transactions_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_transactions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          expected_return_date: string | null
          id: string
          issue_date: string
          notes: string | null
          person_contact: string | null
          person_name: string
          return_date: string | null
          section_id: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          expected_return_date?: string | null
          id?: string
          issue_date: string
          notes?: string | null
          person_contact?: string | null
          person_name: string
          return_date?: string | null
          section_id?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          expected_return_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          person_contact?: string | null
          person_name?: string
          return_date?: string | null
          section_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          madrasa_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          madrasa_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          madrasa_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sections: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      stock_items: {
        Row: {
          category: string
          created_at: string | null
          expiry_date: string | null
          id: string
          min_quantity: number | null
          name: string
          price_per_unit: number | null
          quantity: number
          section_id: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          min_quantity?: number | null
          name: string
          price_per_unit?: number | null
          quantity?: number
          section_id?: string | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          min_quantity?: number | null
          name?: string
          price_per_unit?: number | null
          quantity?: number
          section_id?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_usage: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          purpose: string | null
          quantity: number
          stock_item_id: string | null
          usage_date: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          purpose?: string | null
          quantity: number
          stock_item_id?: string | null
          usage_date?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          purpose?: string | null
          quantity?: number
          stock_item_id?: string | null
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_usage_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "accountant" | "viewer" | "donor"
      expense_category:
        | "salaries"
        | "food"
        | "utilities"
        | "books"
        | "furniture"
        | "stationery"
        | "construction"
        | "repairs"
        | "events"
        | "other"
      income_category:
        | "zakat"
        | "sadaqah"
        | "fitrana"
        | "qurbani"
        | "donation"
        | "other"
      payment_method: "cash" | "bank" | "online"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "accountant", "viewer", "donor"],
      expense_category: [
        "salaries",
        "food",
        "utilities",
        "books",
        "furniture",
        "stationery",
        "construction",
        "repairs",
        "events",
        "other",
      ],
      income_category: [
        "zakat",
        "sadaqah",
        "fitrana",
        "qurbani",
        "donation",
        "other",
      ],
      payment_method: ["cash", "bank", "online"],
    },
  },
} as const
