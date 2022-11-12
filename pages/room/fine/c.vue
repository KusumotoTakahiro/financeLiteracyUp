<template>
	<v-row align-content="center" justify="center">
		<v-col cols="12" xs="12" sm="12" md="12" lg="12">
			<v-dialog
				v-model="dialog1"
				outlined
				hide-overlay
				:height="$vuetify.breakpoint.height"
				:max-width="width"
				content-class="rounded-lg elevation-3"
        transition="dialog-bottom-transition"
				persistent
			>
			<v-alert 
				class="
					justify-center 
					text-center 
					text-h6
					pb-0
				"> 現在の罰金項目一覧 </v-alert>
			<v-data-table
			v-model="selected"
        :headers="headers"
        :items="works"
        :single-select="false"
        item-key="content"
        show-select
        class="elevation-1"
        fixed-header
        :height="$vuetify.breakpoint.height/5*3"
			></v-data-table>
			<v-row 
				class="mt-3 mb-3 mx-auto"
				align-content="center" 
				justify="space-around" 
				style="height:40px">
				<v-btn
					class="black--text"
					height="40"
					@click="reportProgress()"
				>自己申告</v-btn>
				<v-btn
					class="black--text px-2"
					height="40"
					@click="goToHome()"
				>Homeに戻る</v-btn>
			</v-row>
			</v-dialog>
		</v-col>
	</v-row>
</template>
<script>


export default ({
	data() {
		return {
			dialog1: true,
			headers: [
				{
					text: '罰則',
					align: 'start',
					sortable: false,
					value: 'content',
				},
				{
					text: '罰金（パパ円）',
					value: 'price'
				}
			],
			works: [],
			selected: [],
		}
	},
	computed: {
		width: function() {
			return this.$vuetify.breakpoint.width/5*4;
		}
	},
	methods: {
		goToHome() {
			this.$router.push('/room');
		},
		reportProgress() {
			console.log('report progress')
		}
	}
})
</script>
<style scoped>

</style>