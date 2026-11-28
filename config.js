/* MotoVanta public Supabase configuration.
   Browser-safe project URL + publishable key.
   NEVER place a Supabase secret/service_role key in this file.
*/
window.MOTOVANTA_CONFIG = {
  SUPABASE_URL: "https://ezmoeszkevpidrqemivv.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_gphNmIQjIAE0YhS2IrESvw_nBOxwmos",

  /* Display-only currency rates: how many units of each currency = 1 USD.
     Prices are stored in USD in the admin. Edit these numbers any time
     to update the converted prices shown to visitors (approx. Nov 2026). */
  CURRENCY_RATES: { USD: 1, CAD: 1.41, AUD: 1.46, BDT: 124 }
};
