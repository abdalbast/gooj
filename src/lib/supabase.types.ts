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
      web_vitals_events: {
        Row: {
          app_version: string;
          captured_at: string;
          device_class: string;
          environment: string;
          id: number;
          metric_delta: number;
          metric_id: string;
          metric_name: string;
          metric_value: number;
          navigation_type: string;
          network_type: string | null;
          page_type: string;
          rating: string;
          received_at: string;
          referrer_category: string;
          route_key: string;
          route_path: string;
          sample_rate: number;
          save_data: boolean | null;
          schema_version: number;
          viewport_bucket: string;
          was_restored_from_bfcache: boolean;
        };
        Insert: {
          app_version: string;
          captured_at: string;
          device_class: string;
          environment: string;
          id?: number;
          metric_delta: number;
          metric_id: string;
          metric_name: string;
          metric_value: number;
          navigation_type: string;
          network_type?: string | null;
          page_type: string;
          rating: string;
          received_at?: string;
          referrer_category: string;
          route_key: string;
          route_path: string;
          sample_rate: number;
          save_data?: boolean | null;
          schema_version?: number;
          viewport_bucket: string;
          was_restored_from_bfcache?: boolean;
        };
        Update: {
          app_version?: string;
          captured_at?: string;
          device_class?: string;
          environment?: string;
          id?: number;
          metric_delta?: number;
          metric_id?: string;
          metric_name?: string;
          metric_value?: number;
          navigation_type?: string;
          network_type?: string | null;
          page_type?: string;
          rating?: string;
          received_at?: string;
          referrer_category?: string;
          route_key?: string;
          route_path?: string;
          sample_rate?: number;
          save_data?: boolean | null;
          schema_version?: number;
          viewport_bucket?: string;
          was_restored_from_bfcache?: boolean;
        };
      };
    };
    Functions: {
      get_web_vitals_daily_trends: {
        Args: {
          environment_filter?: string | null;
          release_filter?: string | null;
          window_days?: number;
        };
        Returns: {
          bucket_date: string;
          metric_name: string;
          p75_value: number;
          rating: string;
          sample_count: number;
        }[];
      };
      get_web_vitals_device_summary: {
        Args: {
          environment_filter?: string | null;
          release_filter?: string | null;
          window_days?: number;
        };
        Returns: {
          device_class: string;
          metric_name: string;
          p75_value: number;
          rating: string;
          sample_count: number;
        }[];
      };
      get_web_vitals_overview: {
        Args: {
          environment_filter?: string | null;
          release_filter?: string | null;
          window_days?: number;
        };
        Returns: {
          good_count: number;
          metric_name: string;
          needs_improvement_count: number;
          p75_value: number;
          poor_count: number;
          rating: string;
          sample_count: number;
        }[];
      };
      get_web_vitals_release_summary: {
        Args: {
          environment_filter?: string | null;
          release_limit?: number;
          window_days?: number;
        };
        Returns: {
          app_version: string;
          last_received_at: string;
          metric_name: string;
          p75_value: number;
          rating: string;
          sample_count: number;
        }[];
      };
      get_web_vitals_route_summary: {
        Args: {
          environment_filter?: string | null;
          limit_count?: number;
          release_filter?: string | null;
          window_days?: number;
        };
        Returns: {
          metric_name: string;
          p75_value: number;
          page_type: string;
          poor_count: number;
          poor_rate: number;
          rating: string;
          route_key: string;
          sample_count: number;
        }[];
      };
      lookup_active_promotion: {
        Args: {
          code_input: string;
        };
        Returns: {
          code: string;
          discount_label: string;
          expires_at: string;
          promo_type: string;
        }[];
      };
    };
  };
}
