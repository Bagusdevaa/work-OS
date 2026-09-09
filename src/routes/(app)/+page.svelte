<script lang="ts">
	let { data } = $props();
</script>

<h1>Hello, {data.user.displayName ?? data.user.email}</h1>
<form method="POST" action="/auth/signout"><button type="submit">Sign out</button></form>
