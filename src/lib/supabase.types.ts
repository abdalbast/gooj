export interface Database {
  public: {
    Tables: {
      admin_content_blocks: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          section: string;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          section: string;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          section?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
      };
      admin_customers: {
        Row: {
          created_at: string;
          date_joined: string;
          email: string;
          full_name: string;
          id: string;
          last_order_at: string | null;
          orders_count: number;
          total_spent_pence: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          date_joined?: string;
          email: string;
          full_name: string;
          id?: string;
          last_order_at?: string | null;
          orders_count?: number;
          total_spent_pence?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          date_joined?: string;
          email?: string;
          full_name?: string;
          id?: string;
          last_order_at?: string | null;
          orders_count?: number;
          total_spent_pence?: number;
          updated_at?: string;
        };
      };
      admin_orders: {
        Row: {
          created_at: string;
          customer_email: string;
          customer_id: string | null;
          customer_name: string;
          id: string;
          items: string;
          order_date: string;
          order_number: string;
          personalised: boolean;
          status: string;
          total_pence: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          customer_email: string;
          customer_id?: string | null;
          customer_name: string;
          id?: string;
          items: string;
          order_date?: string;
          order_number: string;
          personalised?: boolean;
          status: string;
          total_pence: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          customer_email?: string;
          customer_id?: string | null;
          customer_name?: string;
          id?: string;
          items?: string;
          order_date?: string;
          order_number?: string;
          personalised?: boolean;
          status?: string;
          total_pence?: number;
          updated_at?: string;
        };
      };
      admin_products: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          id: string;
          is_active: boolean;
          name: string;
          price_pence: number;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description: string;
          id?: string;
          is_active?: boolean;
          name: string;
          price_pence: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          price_pence?: number;
          updated_at?: string;
        };
      };
      admin_promotions: {
        Row: {
          active: boolean;
          code: string;
          created_at: string;
          discount_label: string;
          expires_at: string;
          id: string;
          promo_type: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          code: string;
          created_at?: string;
          discount_label: string;
          expires_at: string;
          id?: string;
          promo_type: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          code?: string;
          created_at?: string;
          discount_label?: string;
          expires_at?: string;
          id?: string;
          promo_type?: string;
          updated_at?: string;
        };
      };
      admin_users: {
        Row: {
          active: boolean;
          created_at: string;
          email: string;
          full_name: string | null;
          role: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          email: string;
          full_name?: string | null;
          role?: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          role?: string;
          user_id?: string;
        };
      };
      reminders: {
        Row: {
          created_at: string;
          id: string;
          notes: string;
          occasion: string;
          recipient_name: string;
          reminder_date: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string;
          occasion: string;
          recipient_name: string;
          reminder_date: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string;
          occasion?: string;
          recipient_name?: string;
          reminder_date?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
  };
}
